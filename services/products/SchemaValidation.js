// services/product/SchemaValidation.js
import Joi from 'joi';

class SchemaValidation {
    // Define the product schema using Joi
    static getProductSchema() {
        return Joi.object({
            VendorSku: Joi.string().required().label('VendorSku'),
            Status: Joi.string().valid('Active', 'Inactive').required().label('Status'), // Assuming status is either Active or Inactive
            Stock: Joi.number().integer().min(0).required().label('Stock'),
            Details: Joi.object({
                Name: Joi.string().required().label('Name'),
                CostPrice: Joi.number().required().label('CostPrice'),
                SalePrice: Joi.number().required().label('SalePrice'),
                BrandName: Joi.string().optional().label('BrandName'),
                Image: Joi.string().uri().optional().label('Image'), // Assuming URL format
                Attributes: Joi.object()
                    .pattern(Joi.string(), Joi.string().required())
                    .optional()
                    .label('Attributes') // Optional but if present, each key must have a value
            }).required().label('Details'),
        });
    }

    // Function to validate a single product
    static validateProduct(product) {
        const schema = this.getProductSchema();
        const { error, value } = schema.validate(product, { abortEarly: false });

        if (error) {
            return {
                success: false,
                errors: error.details.map((err) => err.message), // Return a list of error messages
            };
        }

        return { success: true, value };
    }

    // Function to validate multiple products
    static validateProducts(products) {
        const results = products.map((product) => this.validateProduct(product));

        const invalidProducts = results.filter((result) => !result.success);

        return {
            success: invalidProducts.length === 0,
            validatedProducts: results.filter((result) => result.success).map((res) => res.value),
            errors: invalidProducts.map((result, index) => ({
                index,
                errors: result.errors
            })),
        };
    }
}

export default SchemaValidation;
