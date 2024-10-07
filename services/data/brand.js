import { searchIndex } from '@/services/open-search/wrapper';
// Function to retrieve a single vendor by ID
export async function getUniqueBrandNames(vendorId) {
  

    // Define the aggregation query
    const aggs = {
        unique_brands: {
            terms: {
                field: 'brand_name.keyword',  // Use .keyword if brand_name is a text field
                size: 20                   // Adjust size based on expected unique brands
            }
        }
    };
    const query = {
        bool: {
            must: [
                { term: { entity_type: 'Product' } },
                { term: { pk: 'VENDORPRODUCT'+vendorId } }
            ]
        }
    };

    try {
        const response = await searchIndex(index, query, aggs);

        console.log(response)
        // Extract the aggregation results
        const brandBuckets = response.aggregations.unique_brands.buckets;
        const uniqueBrandNames = brandBuckets.map(bucket => bucket.key);

        console.log('Unique Brand Names:', uniqueBrandNames);
        return uniqueBrandNames;
    } catch (error) {
        console.error('Error fetching unique brand names:', error);
        throw error;
    }
}