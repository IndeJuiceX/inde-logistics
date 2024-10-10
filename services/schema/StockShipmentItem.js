import Joi from 'joi';

// Define the vendor SKU array schema
export const getVendorSkuArraySchema = () => Joi.array()
  .items(Joi.string().required().label('vendor_sku'))
  .required()
  .label('items');

// Function to validate an array of vendor SKUs
export const validateVendorSkuArray = (items) => {
  const schema = getVendorSkuArraySchema();
  const { error, value } = schema.validate(items, { abortEarly: false });

  if (error) {
    const validationErrors = error.details.map((detail) => ({
      item: detail.context.label,
      error: detail.message,
    }));
    return { success: false, errors: validationErrors };
  }

  return { success: true, validatedItems: value };
};