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

// Function to validate a single order item
export const validateOrderItem = (item) => {
  const schema = getOrderItemSchema();
  const { error, value } = schema.validate(item, { abortEarly: false });

  if (error) {
    // Collect all error messages
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return { success: false, errors };
  } else {
    return { success: true, value };
  }
};


// Function to validate multiple order items
export const validateOrderItems = (items) => {
  const validatedItems = [];
  const invalidItems = [];

  items.forEach((item, index) => {
    const result = validateOrderItem(item);
    if (result.success) {
      validatedItems.push(result.value);
    } else {
      // For each error in the item, include the index and field path
      result.errors.forEach((error) => {
        invalidItems.push({
          index: index,
          field: error.field,
          message: error.message,
        });
      });
    }
  });

  return {
    success: invalidItems.length === 0,
    validatedItems,
    errors: invalidItems,
  };
};

