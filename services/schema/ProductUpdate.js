import Joi from 'joi';

export const getProductUpdateSchema = () => Joi.object({
  vendor_sku: Joi.string().required().label('vendor_sku'), // Current vendor SKU
  // Uncomment if you want to allow updating the SKU
  // new_vendor_sku: Joi.string().optional().label('new_vendor_sku'), // For updating the SKU
  status: Joi.string().valid('active', 'inactive').optional().label('status'),
  stock_available: Joi.number().integer().min(0).optional().label('stock_available'),
  name: Joi.string().optional().label('name'),
  cost_price: Joi.number().optional().label('cost_price'),
  sale_price: Joi.number().optional().label('sale_price'),
  brand_name: Joi.string().optional().label('brand_name'),
  image: Joi.string().uri().optional().label('image'),
  attributes: Joi.object()
    .pattern(
      Joi.string(),
      Joi.string()
      //Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
    )
    .optional()
    .label('attributes'),
})
  .or(
    // Include 'new_vendor_sku' only if it's uncommented in the schema
    // 'new_vendor_sku',
    'status',
    'stock_available',
    'name',
    'cost_price',
    'sale_price',
    'brand_name',
    'image',
    'attributes',
    'warehouse' // Include if warehouse is uncommented
  )
  .unknown(false)
  .messages({
    'object.missing':
      'At least one field (e.g., status, stock_available, name, etc.) must be provided for the update.',
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
  if (value.name) {
    value.name = value.name.toLowerCase();
  }
  if (value.brand_name) {
    value.brand_name = value.brand_name.toLowerCase();
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