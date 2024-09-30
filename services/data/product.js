// services/data/vendor.js
import { getItem, queryItems, putItem, deleteItem } from '../dynamo/wrapper';

// Function to retrieve a single vendor by ID
export const getProductById = async (vendorId,productUUID) => {
    return await getItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${productUUID}`);
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
