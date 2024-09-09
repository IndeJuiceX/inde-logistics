import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // For DynamoDB operations
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"; // For DocumentClient operations

const TABLE_NAME = '3pl-v2'; // Replace with your actual table name

const MAX_RETRIES = 5;  // Maximum number of retries for unprocessed items
const BASE_DELAY_MS = 100; // Base delay for exponential backoff


// Configure the DynamoDB client for v3
const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// DynamoDBDocumentClient simplifies usage with DynamoDB
const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Put an item in the table with condition
const putItem = async (item) => {
    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK)'
    };

    try {
        await dynamoDocClient.send(new PutCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB PutItem Error:', error);
        return { success: false, error };
    }
};

// Get an item by PK and SK
const getItem = async (pk, sk) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
    };

    try {
        const data = await dynamoDocClient.send(new GetCommand(params));
        if (!data || !data.Item) {
            return { success: false, error: 'Item not found' };
        }
        return { success: true, data: data.Item };
    } catch (error) {
        console.error('DynamoDB GetItem Error:', error);
        return { success: false, error: 'Failed to retrieve item' };
    }
};

// Query items with optional SK prefix
const queryItems = async (pkValue, skPrefix = null) => {
    let params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pkValue',
        ExpressionAttributeValues: {
            ':pkValue': pkValue,
        },
    };

    if (skPrefix) {
        params.KeyConditionExpression += ' AND begins_with(SK, :skPrefix)';
        params.ExpressionAttributeValues[':skPrefix'] = skPrefix;
    }

    try {
        const data = await dynamoDocClient.send(new QueryCommand(params));
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};

// Delete an item by PK and SK
const deleteItem = async (pk, sk) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
    };

    try {
        await dynamoDocClient.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB DeleteItem Error:', error);
        return { success: false, error };
    }
};

// Scan items in the table
const scanItems = async () => {
    const params = {
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: { ':pkPrefix': 'V' },
    };

    try {
        const data = await dynamoDocClient.send(new ScanCommand(params));
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB ScanItems Error:', error);
        return { success: false, error };
    }
};

// Query vendors using a GSI
const queryVendorsUsingGSI = async () => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'EntityType-index',
        KeyConditionExpression: 'EntityType = :entityType',
        ExpressionAttributeValues: {
            ':entityType': 'Vendor',
        },
    };

    try {
        const data = await dynamoDocClient.send(new QueryCommand(params));
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};





// Put items in batch with retry mechanism
const putItemBatch = async (items) => {
    try {
        // Call the generalized batchWriteItems function for put operation
        const { success, results } = await batchWriteItems(items, 'Put');

        if (!success) {
            console.error('Failed to put items.');
            return { success: false };
        }

        // Log the details of the operation
        const totalAdded = results.added.length;
        const totalDuplicates = results.unprocessedItems.length;
        const totalErrors = results.errors.length;

        console.log(`Total added items: ${totalAdded}`);
        console.log(`Total unprocessed items: ${totalDuplicates}`);
        console.log(`Total errors: ${totalErrors}`);

        return { success: true, totalAdded, totalDuplicates, totalErrors };
    } catch (error) {
        console.error('DynamoDB batch put error:', error);
        return { success: false, error };
    }
};


const deleteItemBatch = async (items) => {
    try {
        // Call the generalized batchWriteItems function for delete operation
        const { success, results } = await batchWriteItems(items, 'Delete');

        if (!success) {
            console.error('Failed to delete items.');
            return { success: false };
        }

        // Log the details of the operation
        const totalDeleted = results.added.length;
        const totalUnprocessed = results.unprocessedItems.length;
        const totalErrors = results.errors.length;

        console.log(`Total deleted items: ${totalDeleted}`);
        console.log(`Total unprocessed items: ${totalUnprocessed}`);
        console.log(`Total errors: ${totalErrors}`);

        return { success: true, totalDeleted, totalUnprocessed, totalErrors };
    } catch (error) {
        console.error('DynamoDB batch delete error:', error);
        return { success: false, error };
    }
};

// Generalized batch write function for both Put and Delete operations
const batchWriteItems = async (items, operationType = 'Put') => {
    try {
        const added = [];
        const unprocessedItems = [];
        const errors = [];
        const batches = [];

        // DynamoDB allows up to 25 items per batch write
        while (items.length) {
            batches.push(items.splice(0, 25));
        }

        const batchPromises = batches.map(async (batch, index) => {
            const params = {
                RequestItems: {
                    [TABLE_NAME]: batch.map((item) => {
                        if (operationType === 'Put') {
                            return {
                                PutRequest: {
                                    Item: item,
                                },
                            };
                        } else if (operationType === 'Delete') {
                            return {
                                DeleteRequest: {
                                    Key: {
                                        PK: item.PK,
                                        SK: item.SK,
                                    },
                                },
                            };
                        }
                    }),
                },
            };

            let response;
            try {
                response = await dynamoDocClient.send(new BatchWriteCommand(params));
            } catch (error) {
                console.error(`Error processing ${operationType} batch ${index + 1}:`, error);
                return errors.push({ batch, error });
            }

            // Handle unprocessed items
            const unprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];
            unprocessedItems.push(...unprocessed);

            const successfullyProcessed = batch.length - unprocessed.length;
            added.push(...batch.slice(0, successfullyProcessed));

            console.log(`Batch ${index + 1}: Successfully processed ${successfullyProcessed} items.`);
        });

        await Promise.all(batchPromises);

        // Retry unprocessed items
        if (unprocessedItems.length > 0) {
            console.log(`Retrying ${unprocessedItems.length} unprocessed items...`);
            await retryUnprocessedItems(unprocessedItems, operationType, MAX_RETRIES);
        }

        return { success: true, results: { added, unprocessedItems, errors } };
    } catch (error) {
        console.error(`DynamoDB batch ${operationType.toLowerCase()} error:`, error);
        return { success: false, error };
    }
};

// Retry function with exponential backoff for unprocessed items
const retryUnprocessedItems = async (unprocessedItems, operationType, retriesLeft) => {
    if (retriesLeft === 0) {
        console.error('Max retries reached. Some items could not be processed.');
        return;
    }

    const delay = BASE_DELAY_MS * Math.pow(2, MAX_RETRIES - retriesLeft); // Exponential backoff

    console.log(`Retrying ${unprocessedItems.length} unprocessed items in ${delay} ms...`);

    // Wait for the backoff delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    const params = {
        RequestItems: {
            [TABLE_NAME]: unprocessedItems,
        },
    };

    try {
        const response = await dynamoDocClient.send(new BatchWriteCommand(params));
        const stillUnprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];

        if (stillUnprocessed.length > 0) {
            await retryUnprocessedItems(stillUnprocessed, operationType, retriesLeft - 1);
        }
    } catch (error) {
        console.error(`Error retrying unprocessed ${operationType} items:`, error);
    }
};



export { putItem, getItem, queryItems, deleteItem, scanItems, batchWriteItems, queryVendorsUsingGSI, deleteItemBatch };
