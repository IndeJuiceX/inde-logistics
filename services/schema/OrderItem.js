import Joi from 'joi';

export const getOrderItemSchema = () => Joi.object({
    vendor_sku: Joi.string()
        .required()
        .label('vendor_sku'),

    quantity: Joi.number()
        .integer()
        .positive()
        .required()
        .label('quantity'),

    sales_value: Joi.number()
        .positive()
        .required()
        .label('sales_value'),
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
  
    // Validate each item in the 'items' array using your existing validateOrderItems function
    const itemValidationResult = validateOrderItems(order.items || []);
  
    // Collect item-level validation errors
    if (!itemValidationResult.success) {
      itemValidationResult.errors.forEach((itemError) => {
        // Each itemError has 'errors' and 'item' properties
        const itemIdentifier = itemError.item; // This could be vendor_sku or the item object
        itemError.errors.forEach((errorMsg) => {
          errors.push({
            message: errorMsg,
            item: itemIdentifier,
          });
        });
      });
    }
  
    if (errors.length > 0) {
      return {
        success: false,
        errors, // Detailed error information including item-level errors
      };
    }
  
    // Replace the items in validatedOrder with the validated items
    validatedOrder.items = itemValidationResult.validatedItems;
  
    return {
      success: true,
      order: validatedOrder, // Return the validated order under the 'order' key
    };
  };

// Function to validate multiple stock shipment items
export const validateOrderItems = (items) => {
    const validatedItems = [];
    const invalidItems = [];

    items.forEach((item) => {
        const result = validateOrderItem(item);
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