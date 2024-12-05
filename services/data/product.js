'use server'


import { getItem, queryItems,batchGetItems, putItem, deleteItem, queryItemsWithPkAndSk, updateItem } from '@/services/external/dynamo/wrapper';
import { cleanResponseData } from '@/services/utils';
// Function to retrieve a single vendor by ID
export const getProductById = async (vendorId, productUUID, excludeFields = []) => {
    const data = await getItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${productUUID}`);
    if (data.success && data.data) {
        data.data = cleanResponseData(data.data, excludeFields)
    }
    return data;
};

export const getProductByVendorSku = async (vendorId, vendor_sku) => {
    if (!vendorId || !vendor_sku) {
        throw new Error('vendorId and vendor_sku are required');
    }
    const params = {
        IndexName: 'vendor_sku_index',  // Your GSI's name in DynamoDB
        KeyConditionExpression: 'pk = :pk AND vendor_sku = :vendor_sku',
        ExpressionAttributeValues: {
            ':pk': `VENDORPRODUCT#${vendorId}`,  // Partition key (pk)
            ':vendor_sku': vendor_sku,  // Sort key (vendor_sku)
        },
        Limit: 1,  // Assuming vendor_sku is unique for a vendor, limit to 1 result
    };
    return await queryItems(params);
};

export async function getVendorProductsByName(vendorId, name, options = {}) {
    const capitalizedName = capitalizeWords(name)
    const params = {
        IndexName: 'product_name_index',  // Your GSI's name in DynamoDB
        KeyConditionExpression: 'pk = :pk AND begins_with(#productName, :productName)',
        ExpressionAttributeNames: {
            '#productName': 'name'
        },
        ExpressionAttributeValues: {
            ':productName': capitalizedName,  // Partition key (name)
            ':pk': `VENDORPRODUCT#${vendorId}`,  // Sort key (pk)
        },
    };
    if (options?.lastEvaluatedKey) {
        params.ExclusiveStartKey = options.lastEvaluatedKey
    }
    params.Limit = options.limit


    const data = await queryItems(params);
    if (data && data.success) {
        return { success: true, data: cleanResponseData(data.data), lastEvaluatedKey: data.lastEvaluatedKey, hasMore: data.hasMore }
    }
    return { success: false, error: data.error }

}

export const searchProducts = async (vendorId, query, queryBy = 'name', options) => {
    // Calculate the `from` value to skip the appropriate number of documents
    if (query) {
        if (queryBy == 'vendor_sku') {
            const params = {
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                ExpressionAttributeValues: {
                    ':skPrefix': query,  // Partition key (name)
                    ':pk': `VENDORPRODUCT#${vendorId}`,  // Sort key (pk)
                },
            };
            if (options?.lastEvaluatedKey) {
                params.ExclusiveStartKey = options.lastEvaluatedKey
            }
            if (options?.limit) {
                params.Limit = options.limit
            }
            const queryRes = await queryItems(params)
            if (queryRes.success) {
                return { success: true, data: queryRes.data, hasMore: queryRes?.hasMore, lastEvaluatedKey: queryRes?.lastEvaluatedKey }
            }
        }
        const resp = await getVendorProductsByName(vendorId, query, options)
        console.log('QUER RESP')
        console.log(resp)
        if (resp.success) {
            return { success: true, data: resp.data, hasMore: resp?.hasMore, lastEvaluatedKey: resp?.lastEvaluatedKey }
        }
        return { success: false, error: 'Product Search failed.' }

    }
    return { success: false, error: 'Query cannot be empty' }

};

export const checkProductExists = async (vendorId, vendor_sku) => {
    try {
        const result = await getProductByVendorSku(vendorId, vendor_sku);
        if (result && result.Items && result.Items.length > 0) {
            // Product exists
            return {
                exists: true,
                product: result.Items[0],
            };
        } else {
            // Product does not exist
            return {
                exists: false,
                message: `Product with vendor_sku "${vendor_sku}" does not exist.`,
            };
        }
    } catch (error) {
        console.error(`Error checking product existence for vendor_sku "${vendor_sku}":`, error);
        throw new Error(`Error checking product existence for vendor_sku "${vendor_sku}": ${error.message}`);
    }
};

export const checkProductStock = async (vendorId, vendor_sku, requestedQuantity) => {
    try {
        // Retrieve the product
        const productResult = await getProductById(vendorId, vendor_sku);

        if (!productResult || !productResult.data) {
            // Product does not exist
            return {
                exists: false, // Product does not exist
                success: false,
                message: `Product with vendor_sku "${vendor_sku}" does not exist.`,
            };
        }

        const product = productResult.data;

        if(product.status?.toLowerCase() !== 'active') {
            return {
                exists: false, // Product does not exist
                success: false,
                message: `Product with vendor_sku "${vendor_sku}" is not active`,
            };
        }
        // Extract the available stock from the product data
        // Adjust the field name based on how you store the stock levels
        let availableStock = product.stock_available || 0;

        // Ensure availableStock is a number
        availableStock = Number(availableStock);

        if (isNaN(availableStock)) {
            // Handle cases where stock information is missing or invalid
            return {
                exists: true,
                success: false,
                message: `Stock information for vendor_sku "${vendor_sku}" is unavailable or invalid.`,
            };
        }

        if (availableStock >= requestedQuantity) {
            // Sufficient stock available
            return {
                exists: true,
                success: true,
                availableStock: availableStock,
            };
        } else {
            // Insufficient stock
            return {
                exists: true,
                success: false,
                message: `Insufficient stock for vendor_sku "${vendor_sku}". Requested: ${requestedQuantity}, Available: ${availableStock}`,
            };
        }
    } catch (error) {
        console.error(`Error checking stock for vendor_sku "${vendor_sku}":`, error);
        throw new Error(`Error checking stock for vendor_sku "${vendor_sku}": ${error.message}`);
    }
};

export const getAllVendorProducts = async (vendorId, pageSize = 25, exclusiveStartKey = null) => {
    const pkVal = `VENDORPRODUCT#${vendorId}`;
    const params = {
        KeyConditionExpression: 'pk = :pkVal',
        ExpressionAttributeValues: {
            ':pkVal': pkVal,
        },
        Limit: pageSize,
    };

    if (exclusiveStartKey) {
        params.ExclusiveStartKey = exclusiveStartKey;
    }

    try {
        const result = await queryItems(params);
        console.log(result)
        if (result.success) {
            const hasMore = !!result.lastEvaluatedKey;

            return {
                success: true,
                data: cleanResponseData(result.data, ['warehouse']),
                hasMore: hasMore,
                lastEvaluatedKey: result.lastEvaluatedKey,
            };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Error retrieving all products:', error);
        return { success: false, error: 'Failed to retrieve products' };
    }
};


function capitalizeWords(string) {
    return string.replace(/\b\w/g, char => char.toUpperCase());
}

export async function addBarcodeToProduct(vendorId, vendorSku, newBarcode) {
    // Step 1: Fetch the existing product item

    try {
        if(!vendorId || !vendorSku || !newBarcode) {
            return { success: false, message: "vendor_id, vendor_sku and barcode is required" };

        }
        const existingProductData = await getItem(`VENDORPRODUCT#${vendorId}`,`PRODUCT#${vendorSku}`);
        const existingProduct = existingProductData?.data || null
        if(!existingProduct) {
            return { success: false, message: "Product not found" };
        }

        const existingBarcodes = Array.isArray(existingProduct?.barcodes) ? existingProduct.barcodes : [];

        // Step 2: Check if the barcode already exists
        if (existingBarcodes.includes(newBarcode)) {
            return { success: false, message: "Barcode already exists" };
        }

        // Step 3: Add the new barcode to the list
        const updatedBarcodes = [...existingBarcodes, newBarcode];

        // Step 4: Use updateItem to update the item in DynamoDB
        const updatedFields = {
            barcodes: updatedBarcodes
        };

        const result = await updateItem(existingProduct.pk, existingProduct.sk, updatedFields);
        if(!result || !result?.success) {
            return { success: false, message: "Failed to add barcode to the Product" };

        }
        return { success: true, message: "Barcode added successfully" };

        //return result;

    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export const getMultipleProductsByIds = async (vendorId, vendorSkus, attributes = []) => {
    // Construct the keyPairs for batchGetItems
    const keyPairs = vendorSkus.map((vendorSku) => ({
        pk: `VENDORPRODUCT#${vendorId}`,
        sk: `PRODUCT#${vendorSku}`,
    }));

    // // Options for batchGetItems
    // const options = {
    //     attributes, // Optional: specify attributes to retrieve
    //     // You can add other options like concurrencyLimit, retryLimit if needed
    // };
    
    console.log(keyPairs)
    // Call batchGetItems with the constructed keyPairs
    const result = await batchGetItems(keyPairs);

    console.log(result)
    // Handle the result
    if (result.success) {
        return { success: true, data: cleanResponseData(result.data,['warehouse']) };
    } else {
        // Optionally, process the error further or log it
        console.error('Error fetching products:', result.error);
        return { success: false, error: result.error };
    }
};
