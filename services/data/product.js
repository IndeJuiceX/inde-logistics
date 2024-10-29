// services/data/vendor.js
import { getItem, queryItems, putItem, deleteItem } from '@/services/dynamo/wrapper';
import { searchIndex } from '@/services/open-search/wrapper';
import { cleanResponseData } from '@/services/utils';
// Function to retrieve a single vendor by ID
export const getProductById = async (vendorId, productUUID) => {
    const data = await getItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${productUUID}`);
    if(data.success && data.data) {
        data.data=cleanResponseData(data.data,['warehouse'])
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

export const searchProducts = async (vendorId, searchQuery, brands, page = 1, pageSize = 20) => {
    // Calculate the `from` value to skip the appropriate number of documents
    const from = (page - 1) * pageSize;
    const size = pageSize;
    // Build the base must array with the common filters
    const must = [
        { term: { 'entity_type.keyword': 'Product' } },           // Match the exact entity_type
        { term: { 'pk.keyword': 'VENDORPRODUCT#' + vendorId } }   // Exact match for the vendor's product ID (pk)
    ];

    // Add full-text search on name only if the searchQuery is provided
    if (searchQuery) {
        must.push({ match: { name: searchQuery } });
    }
    if (brands.length > 0) {
        must.push({
            terms: { 'brand_name.keyword': brands },
        });
    }

    // Perform the search without the "query" wrapping
    const response = await searchIndex({
        bool: {
            must: must
        }
    }, {}, from, size);  // Pass pagination parameters

    // Extract the results and total hits
    const results = response.hits.hits;
    const totalHits = response.hits.total.value;  // Total number of matched records

    // Extract only the _source field
    const sources = results.map(item => item._source);

    return {
        success: true,
        data: sources,
        pagination: {
            page,
            pageSize,
            total: totalHits  // Use total hits for pagination, not results length
        }
    };
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
                data: cleanResponseData(result.data,['warehouse']),
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


