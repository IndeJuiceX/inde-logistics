import Joi from 'joi';

// Define the product update schema using Joi
export const getProductUpdateSchema = () => Joi.object({
  vendor_sku: Joi.string().required().label('vendor_sku'), // Current vendor SKU
  new_vendor_sku: Joi.string().optional().label('new_vendor_sku'), // For updating the SKU
  status: Joi.string().valid('Active', 'Inactive').optional().label('status'),
  stock: Joi.number().integer().min(0).optional().label('stock'),
  name: Joi.string().optional().label('name'),
  cost_price: Joi.number().optional().label('cost_price'),
  sale_price: Joi.number().optional().label('sale_price'),
  brand_name: Joi.string().optional().label('brand_name'),
  image: Joi.string().uri().optional().label('image'),
  attributes: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
  ).optional().label('attributes'),
  // You can uncomment the warehouse field if needed
  /*warehouse: Joi.alternatives().try(
    Joi.array().empty(),
    Joi.object().pattern(Joi.string(), Joi.any())
  ).optional().label('warehouse'),*/
})
  .or(
    'new_vendor_sku', 'status', 'stock', 'name', 'cost_price', 'sale_price',
    'brand_name', 'image', 'attributes' /*, 'warehouse'*/
  )
  .unknown(false)
  .messages({
    'object.missing':
      'At least one field (e.g., status, stock, name, etc.) must be provided for the update.',
  });

// Function to validate a single product update
export const validateProductUpdate = (product) => {
  const schema = getProductUpdateSchema();
  const { error, value } = schema.validate(product, { abortEarly: false });

  if (error) {
    return {
      success: false,
      errors: error.details.map((err) => err.message),
    };
  }

  return { success: true, value };
};

// Function to validate multiple product updates
export const validateProductUpdates = (products) => {
  const validatedProducts = [];
  const invalidProducts = [];

  products.forEach((product) => {
    const result = validateProductUpdate(product);
    if (result.success) {
      validatedProducts.push(result.value);
    } else {
      invalidProducts.push({
        errors: result.errors,
        product: product.vendor_sku,
      });
    }
  });

  return {
    success: invalidProducts.length === 0,
    validatedProducts,
    errors: invalidProducts,
  };
};