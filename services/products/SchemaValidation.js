// services/product/SchemaValidation.js
import Joi from 'joi';

class SchemaValidation {
    // Define the product schema using Joi
    static getProductSchema() {
        return Joi.object({
            vendor_sku: Joi.string().required().label('vendor_sku'),
            status: Joi.string().valid('Active', 'Inactive').required().label('status'), // Assuming status is either Active or Inactive
            stock: Joi.number().integer().min(0).required().label('stock'),
            name: Joi.string().required().label('name'), // Flattened name field
            cost_price: Joi.number().required().label('cost_price'), // Flattened cost_price field
            sale_price: Joi.number().required().label('sale_price'), // Flattened sale_price field
            brand_name: Joi.string().optional().label('brand_name'), // Flattened brand_name field
            image: Joi.string().uri().optional().label('image'), // Flattened image field, assuming URL format
            // Define attributes that can be either string values or arrays of strings
            attributes: Joi.object().pattern(
                Joi.string(),
                Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
            ).optional().label('attributes'),

            // Add an optional warehouse field for stock location details
            // Add an optional warehouse field, which can be non-existent, an empty array, or a valid object
            // Define a loose validation for warehouse, allowing any structure (non-existent, empty array, or object with any keys)
            warehouse: Joi.alternatives().try(
                Joi.array().empty(),  // Allow empty array
                Joi.object().pattern(Joi.string(), Joi.any()) // Allow object with any string keys and any values
            ).optional().label('warehouse'),
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
        const validatedProducts = [];
        const invalidProducts = [];

        products.forEach((product) => {
            const result = this.validateProduct(product);
            if (result.success) {
                validatedProducts.push(result.value); // Valid product
            } else {
                invalidProducts.push({
                    errors: result.errors, // List of error messages
                    product: product.vendor_sku // Return the original product for easier identification by the client
                });
            }
        });

        return {
            success: invalidProducts.length === 0, // If no invalid products, success is true
            validatedProducts, // All valid products
            errors: invalidProducts, // All invalid products with error details
        };
    }
}

export default SchemaValidation;
