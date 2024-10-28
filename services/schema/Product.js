import Joi from 'joi';

// Define the product schema using Joi
export const getProductSchema = () => Joi.object({
  vendor_sku: Joi.string().required().label('vendor_sku'),
  status: Joi.string().valid('Active', 'Inactive').required().label('status'),
  //stock_available: Joi.number().integer().min(0).required().label('stock_available'),
  name: Joi.string().required().label('name'),
  cost_price: Joi.number().required().label('cost_price'),
  sale_price: Joi.number().required().label('sale_price'),
  brand_name: Joi.string().optional().label('brand_name'),
  image: Joi.string().uri().optional().label('image'),
  attributes: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
  ).optional().label('attributes'),
  warehouse: Joi.alternatives().try(
    Joi.array().empty(),
    Joi.object().pattern(Joi.string(), Joi.any())
  ).optional().label('warehouse'),
});

// Function to validate a single product
export const validateProduct = (product) => {
  const schema = getProductSchema();
  const { error, value } = schema.validate(product, { abortEarly: false });

  if (error) {
    return {
      success: false,
      errors: error.details.map((err) => err.message),
    };
  }

  return { success: true, value };
};

// Function to validate multiple products
export const validateProducts = (products) => {
  const validatedProducts = [];
  const invalidProducts = [];

  products.forEach((product) => {
    const result = validateProduct(product);
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