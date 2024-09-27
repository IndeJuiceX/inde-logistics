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

    // Define the product update schema using Joi
    static getProductUpdateSchema() {
        return Joi.object({
            vendor_sku: Joi.string().required().label('vendor_sku'), // Required: the current vendor SKU to identify the product
            new_vendor_sku: Joi.string().optional().label('new_vendor_sku'), // Optional: for updating the vendor SKU
            status: Joi.string().valid('Active', 'Inactive').optional().label('status'), // Status field (optional)
            stock: Joi.number().integer().min(0).optional().label('stock'), // Stock field (optional)
            name: Joi.string().optional().label('name'), // Name field (optional)
            cost_price: Joi.number().optional().label('cost_price'), // Cost price field (optional)
            sale_price: Joi.number().optional().label('sale_price'), // Sale price field (optional)
            brand_name: Joi.string().optional().label('brand_name'), // Brand name (optional)
            image: Joi.string().uri().optional().label('image'), // Image URL (optional)

            // Define attributes (optional)
            attributes: Joi.object().pattern(
                Joi.string(),
                Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
            ).optional().label('attributes'),

            // Define warehouse field (optional)
            warehouse: Joi.alternatives().try(
                Joi.array().empty(),  // Allow empty array
                Joi.object().pattern(Joi.string(), Joi.any()) // Allow object with any string keys and values
            ).optional().label('warehouse'),
        }).or('new_vendor_sku', 'status', 'stock', 'name', 'cost_price', 'sale_price', 'brand_name', 'image', 'attributes', 'warehouse') // Ensure at least one field besides vendor_sku is present
        .messages({
            'object.missing': 'At least one field (e.g., status, stock, name, etc.) must be provided for the update.'
        });
    }

    // Function to validate a single product update
    static validateProductUpdate(product) {
        const schema = this.getProductUpdateSchema();
        const { error, value } = schema.validate(product, { abortEarly: false });

        if (error) {
            return {
                success: false,
                errors: error.details.map((err) => err.message), // Return list of error messages
            };
        }

        return { success: true, value };
    }

    // Function to validate multiple product updates
    static validateProductUpdates(products) {
        const validatedProducts = [];
        const invalidProducts = [];

        products.forEach((product) => {
            const result = this.validateProductUpdate(product);
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
