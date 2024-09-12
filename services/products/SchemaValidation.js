// services/product/SchemaValidation.js
import Joi from 'joi';

class SchemaValidation {
    // Define the product schema using Joi
    static getProductSchema() {
        return Joi.object({
            vendor_sku: Joi.string().required().label('vendor_sku'),
            status: Joi.string().valid('Active', 'Inactive').required().label('status'), // Assuming status is either Active or Inactive
            stock: Joi.number().integer().min(0).required().label('stock'),
            Details: Joi.object({
                name: Joi.string().required().label('name'),
                cost_price: Joi.number().required().label('cost_price'),
                sale_price: Joi.number().required().label('sale_price'),
                brand_name: Joi.string().optional().label('brand_name'),
                image: Joi.string().uri().optional().label('image'), // Assuming URL format
                attributes: Joi.object()
                    .pattern(Joi.string(), Joi.string().required())
                    .optional()
                    .label('attributes') // Optional but if present, each key must have a value
            }).required().label('details'),
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
