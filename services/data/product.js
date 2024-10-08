// services/data/vendor.js
import { getItem, queryItems, putItem, deleteItem } from '@/services/dynamo/wrapper';
import { searchIndex } from '@/services/open-search/wrapper';
// Function to retrieve a single vendor by ID
export const getProductById = async (vendorId, productUUID) => {
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

export const searchProducts = async (searchQuery, vendorId, page = 1, pageSize = 20) => {
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

    // Perform the search without the "query" wrapping
    const response = await searchIndex( {
        bool: {
            must: must
        }
    },{}, from, size);  // Pass pagination parameters

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




