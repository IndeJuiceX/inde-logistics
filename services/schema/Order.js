import Joi from 'joi';
import { validateOrderItems } from './OrderItem'; // Import the item schema
import { getAllCountryCodes } from '@/services/utils/countries.js';
import { generateAddOnKey, getAddOnById } from '@/services/data/add-on';
import { getVendorAddons } from '@/services/data/vendor';
import { getItem, queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';
export const getCountryCodeSchema = () => {
    return Joi.string()
        .required()
        .uppercase()
        .length(2)
        .valid(...getAllCountryCodes())
        .label('country_code')
        .messages({
            'any.required': '"{#label}" is required.',
            'string.length': '"{#label}" must be exactly 2 characters long.',
            'any.only': '"{#label}" must be a valid ISO Alpha-2 country code.',
        });
};

export const getBuyerSchema = () => Joi.object({
    name: Joi.string().required().label('name'),
    phone: Joi.string().required().label('phone'),
    email: Joi.string().email({ tlds: { allow: false } }).required().label('email'),
    address_line_1: Joi.string().required().label('address_line_1'),
    address_line_2: Joi.string().allow('', null).label('address_line_2'),
    address_line_3: Joi.string().allow('', null).label('address_line_3'),
    address_line_4: Joi.string().allow('', null).label('address_line_4'),
    city: Joi.string().required().label('city'),
    postcode: Joi.string().required().label('postcode'),
    country_code: getCountryCodeSchema(),
});

export const getAddOnsSchema = () =>
    Joi.object()
        .pattern(
            Joi.string(), // Add-on keys
            Joi.alternatives().try(
                Joi.boolean(), // Simple add-ons
                Joi.object()
                    .unknown(true) // Allow unknown keys
                    .custom((value, helpers) => {
                        if (Object.keys(value).length === 0) {
                            return helpers.error('object.empty'); // Custom error for empty objects
                        }
                        return value; // Valid object
                    })
            )
        )
        .custom((value, helpers) => {
            // Ensure the `add_ons` object itself is not empty
            if (Object.keys(value).length === 0) {
                return helpers.error('object.base', { message: 'add_ons object must have at least one key.' });
            }
            return value;
        })
        .optional()
        .messages({
            'object.base': 'add_ons object must have at least one key.', // Custom error for root-level empty `add_ons`
            'object.empty': 'Add-on object must have at least one key.', // Custom error for empty add-on values
        });



export const getOrderSchema = () =>
    Joi.object({
        vendor_order_id: Joi.string().required().label('vendor_order_id'),
        shipping_cost: Joi.number().required().label('shipping_cost'),

        shipping_code: Joi.string().required().label('shipping_code'),

        buyer: getBuyerSchema()
            .required()
            .label('buyer'),

        add_ons: getAddOnsSchema(), // Add-ons validation

        // Validate 'items' array in detail
        items: Joi.array().min(1).required().label('items'),
    });

// Function to validate the entire order, including detailed item-level validation
export const validateOrder = async (order, vendorId) => {


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

    // Validate and enrich add-ons if provided
    let appliedAddOns = null;
    if (validatedOrder.add_ons) {
        const addOnValidation = await validateOrderAddOns(validatedOrder.add_ons, vendorId);
        if (!addOnValidation.success) {
            errors.push(...addOnValidation.errors);
        } else {
            appliedAddOns = addOnValidation.appliedAddOns;
        }
    }
    const countryCode = validatedOrder.buyer.country_code//getCountryCode(validatedOrder.buyer.country); //
    //validatedOrder.buyer.country_code = countryCode;

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

    if (appliedAddOns) {
        // Append applied add-ons to the validated order
        validatedOrder.applied_add_ons = appliedAddOns;
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


export const validateOrderAddOns = async (addOns, vendorId) => {
    const errors = [];
    const appliedAddOns = {}; // To store enriched add-ons

    // Retrieve vendor's enabled add-ons
    const vendorAddonsResponse = await getVendorAddons(vendorId);
    if (!vendorAddonsResponse.success) {
        return {
            success: false,
            errors: [
                {
                    message: 'Failed to retrieve vendor add-ons.',
                    path: ['add_ons'],
                },
            ],
        };
    }
    const vendorAddons = vendorAddonsResponse.data;

    // Validate each add-on
    for (const [addOnKey, addOnValue] of Object.entries(addOns)) {
        const addOnId = generateAddOnKey('ORDER', addOnKey); // Generate PK

        // Check if the vendor add-on exists
        const vendorAddOnMetadata = vendorAddons.find((addon) => addon.add_on_id === addOnId);
        if (!vendorAddOnMetadata) {
            errors.push({
                message: `Add-on '${addOnKey}' does not exist or is not enabled for this vendor.`,
                path: ['add_ons', addOnKey],
            });
            continue;
        }

        if (vendorAddOnMetadata.status !== 'enabled') {
            errors.push({
                message: `Add-on '${addOnKey}' is not enabled for this vendor.`,
                path: ['add_ons', addOnKey],
            });
            continue;
        }

        // Fetch add-on metadata for additional details
        const addOnMetadataResponse = await queryItemsWithPkAndSk(vendorAddOnMetadata.sk, 'TYPE#');
        const addOnMetadata = addOnMetadataResponse?.data[0] || null;

        if (!addOnMetadata) {
            errors.push({
                message: `Metadata not found for add-on '${addOnKey}'.`,
                path: ['add_ons', addOnKey],
            });
            continue;
        }

        // Validate required parameters
        if (addOnMetadata?.required_parameters && Array.isArray(addOnMetadata.required_parameters)) {
            for (const param of addOnMetadata.required_parameters) {
                const paramName = param.name;

                if (param.required && (typeof addOnValue !== 'object' || !(paramName in addOnValue))) {
                    errors.push({
                        message: `Missing required parameter '${paramName}' for add-on '${addOnKey}'.`,
                        path: ['add_ons', addOnKey, paramName],
                    });
                    continue;
                }

                // Validate parameter type
                const paramValue = addOnValue[paramName];
               
                if (param.type) {
                    if (
                        (param.type === 'number' && typeof paramValue !== 'number') ||
                        (param.type === 'string' && typeof paramValue !== 'string') ||
                        (param.type === 'boolean' && typeof paramValue !== 'boolean')
                    ) {
                        errors.push({
                            message: `Invalid type for parameter '${paramName}' in add-on '${addOnKey}'. Expected '${param.type}', got '${typeof paramValue}'.`,
                            path: ['add_ons', addOnKey, paramName],
                        });
                    }
                }
            }
        }

        // Determine price
        const price = vendorAddOnMetadata.price || addOnMetadata.price;
        let cost = price;

        if (addOnValue?.quantity) {
            cost = price * addOnValue.quantity;
        }

        // Append enriched add-on to applied_add_ons
        appliedAddOns[addOnKey] = {
            ...addOnValue, // Keep original values
            name: addOnMetadata.name,
            price,
            cost,
            key : addOnMetadata.pk
        };
    }

    return {
        success: errors.length === 0,
        errors,
        appliedAddOns, // Include enriched add-ons
    };
};
