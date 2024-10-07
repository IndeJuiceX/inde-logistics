import osClient from './client';

// Function to search the index
export const searchIndex = async (index = '3pl-v3', query, from = 0, size = 10) => {
    try {
        const result = await osClient.search({
            index,
            body: {
                query: query,
                from: from,     // Pagination: number of documents to skip
                size: size      // Pagination: number of documents to return
            }
        });

        return result.body;  // Return only the search hits
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
