import Joi from 'joi';
import { getOrderItemSchema } from './OrderItem';

// Define the order schema
export const getOrderSchema = () => Joi.object({
    vendor_order_id: Joi.string()
        .required()
        .label('vendor_order_id'),

    // // Status field with specified allowed values
    // status: Joi.string()
    //     .valid('accepted', 'cancelled', 'held', 'dispatched', 'delivered')
    //     .required()
    //     .label('status'),

    // Expected delivery date (ISO 8601 date string)
    expected_delivery_date: Joi.date()
        .iso()
        .required()
        .label('expected_delivery_date'),

    // Shipping cost as a number
    shipping_cost: Joi.number()
        .required()
        .label('shipping_cost'),

    // Buyer object with specified fields
    buyer: Joi.object({
        name: Joi.string()
            .required()
            .label('name'),

        phone: Joi.string()
            .required()
            .label('phone'),

        email: Joi.string()
            .email()
            .required()
            .label('email'),

        address_line_1: Joi.string()
            .required()
            .label('address_line_1'),

        address_line_2: Joi.string()
            .required()
            .label('address_line_2'),

        address_line_3: Joi.string()
            .allow('', null) // Optional field
            .label('address_line_3'),

        address_line_4: Joi.string()
            .allow('', null) // Optional field
            .label('address_line_4'),

        city: Joi.string()
            .required()
            .label('city'),

        postcode: Joi.string()
            .required()
            .label('postcode'),

        country: Joi.string()
            .required()
            .label('country'),
    })
        .required()
        .label('buyer'),

    // Items array
    items: Joi.array()
        .items(getOrderItemSchema())
        .min(1)
        .required()
        .label('items'),
});

// Function to validate a single stock shipment item
export const validateOrder = (item) => {
    const schema = getOrderSchema();
    const { error, value } = schema.validate(item, { abortEarly: false });

    if (error) {
        return {
            success: false,
            errors: error.details.map((err) => err.message),
        };
    }

    return { success: true, value };
};

// Function to validate multiple stock shipment items
export const validateOrders = (items) => {
    const validatedItems = [];
    const invalidItems = [];

    items.forEach((item) => {
        const result = validateOrder(item);
        if (result.success) {
            validatedItems.push(result.value);
        } else {
            invalidItems.push({
                errors: result.errors,
                item: item.vendor_sku || item,
            });
        }
    });

    return {
        success: invalidItems.length === 0,
        validatedItems,
        errors: invalidItems,
    };
};

