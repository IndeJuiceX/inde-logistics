import Joi from 'joi';

// Define the stock shipment item schema
export const getStockShipmentItemSchema = () => Joi.object({
  vendor_sku: Joi.string().required().label('vendor_sku'),
  stock_in: Joi.number().integer().min(0).required().label('stock_in'),
});

// Function to validate a single stock shipment item
export const validateStockShipmentItem = (item) => {
  const schema = getStockShipmentItemSchema();
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
export const validateStockShipmentItems = (items) => {
  const validatedItems = [];
  const invalidItems = [];

  items.forEach((item) => {
    const result = validateStockShipmentItem(item);
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

