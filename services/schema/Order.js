import Joi from 'joi';
import { validateOrderItems } from './OrderItem'; // Import the item schema
import { getOfficialCountryName, getCountryCode } from '@/services/utils/countries.js';
/**
 * Generates a Joi validation schema for the country field.
 * @returns {Joi.StringSchema} Joi validation schema for country
 */
export const getCountrySchema = () => {
    return Joi.string()
        .required()
        //.valid(...getOfficialCountryNames())
        .label('country')
        .custom((value, helpers) => {
            const countryCode = getCountryCode(value);

            if (!countryCode) {
                return helpers.error('any.invalid', { value });
            }

            // Get the official country name
            const officialCountryName = getOfficialCountryName(countryCode);

            return officialCountryName;
        }, 'Country Name Validation')
        .messages({
            'any.invalid': '"{#label}" must be a valid official country name in English',
        });
};

export const getBuyerSchema = () => Joi.object({
    name: Joi.string().required().label('name'),
    phone: Joi.string().required().label('phone'),
    email: Joi.string().email().required().label('email'),
    address_line_1: Joi.string().required().label('address_line_1'),
    address_line_2: Joi.string().allow('', null).label('address_line_2'),
    address_line_3: Joi.string().allow('', null).label('address_line_3'),
    address_line_4: Joi.string().allow('', null).label('address_line_4'),
    city: Joi.string().required().label('city'),
    postcode: Joi.string().required().label('postcode'),
    //country: Joi.string().required().label('country'),
    // Use the country schema from the utility module
    country: getCountrySchema(),
});


export const getOrderSchema = () =>
    Joi.object({
        vendor_order_id: Joi.string().required().label('vendor_order_id'),
        shipping_cost: Joi.number().required().label('shipping_cost'),

        shipping_code: Joi.string().required().label('shipping_code'),

        buyer: getBuyerSchema()
            .required()
            .label('buyer'),

        // Validate 'items' array in detail
        items: Joi.array().min(1).required().label('items'),
    });

// Function to validate the entire order, including detailed item-level validation
export const validateOrder = (order) => {
    const orderSchema = getOrderSchema();
    const { error: orderError, value: validatedOrder } = orderSchema.validate(order, { abortEarly: false });

    const errors = [];

    // Collect order-level validation errors
    if (orderError) {
        orderError.details.forEach((err) => {
            errors.push({
                message: err.message,
                path: err.path,
            });
        });
    }
    const countryCode = getCountryCode(validatedOrder.buyer.country); //
    validatedOrder.buyer.country_code = countryCode;

    // Validate each item in the 'items' array
    const itemValidationResult = validateOrderItems(order.items || [], countryCode);

    // Collect item-level validation errors
    if (itemValidationResult.errors.length > 0) {
        itemValidationResult.errors.forEach((itemError) => {
            errors.push({
                message: itemError.message,
                path: ['items', itemError.index, itemError.field],
            });
        });
    }

    if (errors.length > 0) {
        return {
            success: false,
            errors, // Detailed error information
        };
    }

    // Replace the items in validatedOrder with the validated items
    validatedOrder.items = itemValidationResult.validatedItems;

    return {
        success: true,
        order: validatedOrder, // Return the validated order under the 'order' key
    };
};



export const orderUpdateSchema = Joi.object({
    vendor_order_id: Joi.string().required().label('vendor_order_id'),
    buyer: getBuyerSchema().required().label('buyer'),
    // Add other fields to be updated if needed
});

export const validateOrderUpdateSchema = (payload) => {
    const { error, value } = orderUpdateSchema.validate(payload, { abortEarly: false });
    if (error) {
        return {
            success: false,
            errors: error.details.map((err) => ({
                message: err.message,
                path: err.path,
            })),
        };
    }
    return {
        success: true,
        value,
    };
};
