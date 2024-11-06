// services/data/vendor.js
import { getItem, queryItems, putItem, deleteItem, queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';
import { cleanResponseData } from '@/services/utils';
// Function to retrieve a single vendor by ID
export const getProductById = async (vendorId, productUUID, excludeFields=[]) => {
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

export async function getVendorProductsByName(vendorId, name) {
    const params = {
        IndexName: 'product_name_index',  // Your GSI's name in DynamoDB
        KeyConditionExpression: 'pk = :pk AND name = :productName',
        ExpressionAttributeValues: {
            ':pk': `VENDORPRODUCT#${vendorId}`,  // Partition key (pk)
            ':productName': name,  // Sort key (vendor_sku)
        },
    };
    return await queryItems(params);
}

export const searchProducts = async (vendorId, query, queryBy='name') => {
    // Calculate the `from` value to skip the appropriate number of documents
    if(query) {
        if(queryBy=='vendor_sku') {
            const queryRes = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${query}`)
            if(queryRes.success) {
                return {success : true, data : queryRes.data}
            }
        }
        const resp = await getVendorProductsByName(vendorId,query)
        if(resp.success) {
            return {success:true, data: resp.data}
        }
        return{success:false , error : 'Product Search failed.'}

    }
    return{success:false , error : 'Query cannot be empty'}
   
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


