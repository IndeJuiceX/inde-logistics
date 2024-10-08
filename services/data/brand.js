import { searchIndex } from '@/services/open-search/wrapper';
// Function to retrieve a single vendor by ID
export async function getUniqueBrandNames(vendorId) {
  
    console.log('VENDOR ID IN QUERY IS '+vendorId)
    // Define the aggregation query
    const aggs = {
        unique_brands: {
            terms: {
                field: 'brand_name.keyword',  // Use .keyword if brand_name is a text field
                size: 1000                   // Adjust size based on expected unique brands
            }
        }
    };
    const query = {
        bool: {
            must: [
                { term: { 'entity_type.keyword': 'Product' } },
                { term: { 'pk.keyword': 'VENDORPRODUCT#'+vendorId } }
            ]
        }
    };

    try {
        const response = await searchIndex( query, aggs);

        // Extract the aggregation results
        const brandBuckets = response.aggregations.unique_brands.buckets;
        const uniqueBrandNames = brandBuckets.map(bucket => bucket.key);

        console.log('Unique Brand Names:', uniqueBrandNames);
        return {success: true, data : uniqueBrandNames};
    } catch (error) {
        console.error('Error fetching unique brand names:', error);
        throw error;
    }
}