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
  customs_code: Joi.alternatives().conditional(Joi.ref('$country_code'), {
    is: 'GB',
    then: Joi.any().strip(), // Remove customs_code when country_code is 'GB' //Joi.string().optional().label('customs_code')
    otherwise: Joi.string().required().label('customs_code'),
  }),
  customs_description: Joi.alternatives().conditional(Joi.ref('$country_code'), {
    is: 'GB',
    then: Joi.any().strip(), // Remove customs_code when country_code is 'GB' //Joi.string().optional().label('customs_code')
    otherwise: Joi.string().required().label('customs_description'),
  }),
});

// Function to validate a single order item
export const validateOrderItem = (item, country_code) => {
  const schema = getOrderItemSchema();
  const { error, value } = schema.validate(item, {
    abortEarly: false,
    context: { country_code },
  });
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
export const validateOrderItems = (items, countryCode) => {
  const validatedItems = [];
  const invalidItems = [];
  const seenSkus = new Set();

  items.forEach((item, index) => {
    const result = validateOrderItem(item, countryCode);
    if (result.success) {
      const sku = item.vendor_sku;

      // Check for duplicate vendor_sku
      if (seenSkus.has(sku)) {
        invalidItems.push({
          index: index,
          field: 'vendor_sku',
          message: `Duplicate vendor_sku found: ${sku}`,
        });
      } else {
        seenSkus.add(sku);
        validatedItems.push(result.value);
      }
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

