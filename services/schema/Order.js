import Joi from 'joi';
import { validateOrderItems } from './OrderItem';

// Define the order schema
export const getOrderSchema = () => Joi.object({
    vendor_order_id: Joi.string()
        .required()
        .label('vendor_order_id'),

    expected_delivery_date: Joi.date()
        .iso()
        .required()
        .label('expected_delivery_date'),

    shipping_cost: Joi.number()
        .required()
        .label('shipping_cost'),

    buyer: Joi.object({
        name: Joi.string().required().label('name'),
        phone: Joi.string().required().label('phone'),
        email: Joi.string().email().required().label('email'),
        address_line_1: Joi.string().required().label('address_line_1'),
        address_line_2: Joi.string().required().label('address_line_2'),
        address_line_3: Joi.string().allow('', null).label('address_line_3'),
        address_line_4: Joi.string().allow('', null).label('address_line_4'),
        city: Joi.string().required().label('city'),
        postcode: Joi.string().required().label('postcode'),
        country: Joi.string().required().label('country'),
    }).required().label('buyer'),

    // Basic validation: items array exists with at least 1 item
    items: Joi.array().min(1).required().label('items'), // Does not do detailed validation here
});


// Function to validate the entire order, including basic validation and detailed item-level validation
export const validateOrder = (order) => {
    const orderSchema = getOrderSchema();
    const { error, value } = orderSchema.validate(order, { abortEarly: false });

    if (error) {
        // Return order-level validation errors (e.g. missing fields like vendor_order_id, buyer)
        return {
            success: false,
            errors: error.details.map((err) => err.message),
        };
    }

    // Now that basic validation has passed, validate the items in detail
    const itemValidationResult = validateOrderItems(order.items);

    if (!itemValidationResult.success) {
        return {
            success: false,
            errors: [
                'Order is valid but one or more items failed validation.',
                ...itemValidationResult.errors.map((err) => `Item ${err.item}: ${err.errors.join(', ')}`)
            ]
        };
    }

    return {
        success: true,
        value: {
            ...value, // Include the order data
            items: itemValidationResult.validatedItems // Include validated items
        }
    };
};


// Function to validate multiple orders and return entire order with validation errors if it fails
export const validateOrders = (orders) => {
    const validatedItems = [];
    const invalidItems = [];

    orders.forEach((order) => {
        const result = validateOrder(order);

        if (result.success) {
            validatedItems.push(result.value);
        } else {
            const itemErrors = [];
            let hasItemLevelError = false;

            // Check if any of the errors are related to items
            result.errors.forEach((error) => {
                if (error.includes('items')) {
                    hasItemLevelError = true;
                }
                itemErrors.push(error);
            });

            // If there is an item-level error, set a custom message
            let errorMessage = hasItemLevelError
                ? 'One or more items failed validation.'
                : 'Order failed validation.';

            // Add the entire order and the custom error message to invalidItems
            invalidItems.push({
                order, // Include the full order data
                errors: itemErrors,
                message: errorMessage, // Custom error message
            });
        }
    });

    return {
        success: invalidItems.length === 0, // If no invalid items, return success as true
        validatedItems, // List of successfully validated orders
        errors: invalidItems, // List of invalid orders and their errors
    };
};




