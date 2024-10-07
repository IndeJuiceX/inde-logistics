import osClient from './client';

// Function to search the index
export const searchIndex = async (index = '3pl-v3', query = {}, aggs = {}, from = 0, size = 10) => {
    try {
        const body = {};

        // Include the query if provided
        if (Object.keys(query).length > 0) {
            body.query = query;
        }

        // Include aggregations if provided
        if (Object.keys(aggs).length > 0) {
            body.aggs = aggs;
        }

        // Include pagination only if fetching documents
        if (Object.keys(query).length > 0 || Object.keys(aggs).length === 0) {
            body.from = from;
            body.size = size;
        } else {
            // If only aggregations are requested, set size to 0
            body.size = 0;
        }

        const result = await osClient.search({
            index,
            body: body
        });

        return result.body;  // Return the entire response body
    } catch (error) {
        console.error('OpenSearch search error:', error);
        throw error;
    }
};


// Function to index data
export const indexData = async (index = '3pl-v3', id, body) => {
    try {
        const result = await osClient.index({
            index,
            id,
            body
        });
        return result.body;  // Return the result of the indexing
    } catch (error) {
        console.error('OpenSearch index error:', error);
        throw error;
    }
};
