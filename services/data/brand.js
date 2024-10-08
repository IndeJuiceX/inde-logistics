import { searchIndex } from '@/services/open-search/wrapper';

export async function getUniqueBrandNames(vendorId, size = 20, searchTerm = '') {

    // Define the aggregation query
    const aggs = {
        unique_brands: {
            terms: {
                field: 'brand_name.keyword',      // Use .keyword if brand_name is a text field
                size: size,                       // Limit the number of brands returned
                order: { _key: 'asc' }            // Optional: order brands alphabetically
            }
        }
    };

    // Include a filter for the searchTerm if provided
    if (searchTerm) {
        aggs.unique_brands.terms.include = `.*${searchTerm}.*`; // Use regex to include matching brands
    }

    // Define the query to filter documents by entity_type and pk (vendorId)
    const query = {
        bool: {
            must: [
                { term: { 'entity_type.keyword': 'Product' } },
                { term: { 'pk.keyword': `VENDORPRODUCT#${vendorId}` } }
            ]
        }
    };

    try {
        const response = await searchIndex(query, aggs);

        // Check if aggregations are present in the response
        if (response.aggregations && response.aggregations.unique_brands) {
            const brandBuckets = response.aggregations.unique_brands.buckets;
            const uniqueBrandNames = brandBuckets.map(bucket => bucket.key);

            // Determine if there are more brands available
            const totalUniqueBrands = response.aggregations.unique_brands.sum_other_doc_count + brandBuckets.length;
            const hasMoreBrands = totalUniqueBrands > size;

            return { success: true, data: uniqueBrandNames, hasMoreBrands };
        } else {
            console.error('No aggregation results found.');
            return { success: false, data: [], message: 'No aggregation results found.' };
        }
    } catch (error) {
        console.error('Error fetching unique brand names:', error);
        return { success: false, data: [], error: error.message };
    }
}