// dynamoFunctions.js
import { getClient } from './client';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand, BatchWriteCommand, ScanCommand, UpdateCommand, TransactWriteCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import pLimit from 'p-limit';
const TABLE_NAME = '3pl-v3'; // Replace with your actual table name

// Configuration for BatchGetItem
const MAX_BATCH_GET_SIZE = 100; // Maximum items per BatchGetItem request
const CONCURRENCY_LIMIT = 10; // Number of parallel BatchGetItem requests
const RETRY_LIMIT = 5; // Maximum number of retries for unprocessed keys
const BACKOFF_BASE_DELAY_MS = 100; // Base delay for exponential backoff in milliseconds

// Existing functions: putItem, getItem, queryItems, deleteItem, etc.

// ... [Existing functions] ...

// Helper Functions
const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retrieves multiple items from DynamoDB using BatchGetItem with parallel fetching and retries.
 * @param {Array} keyPairs - Array of objects containing 'pk' and 'sk' for each item to retrieve.
 * @param {Object} options - Optional configurations.
 * @param {number} options.concurrencyLimit - Number of parallel BatchGetItem requests.
 * @param {number} options.retryLimit - Maximum number of retries for unprocessed keys.
 * @returns {Promise<Object>} - An object containing 'success' status and 'data' or 'error'.
 */
const batchGetItems = async (keyPairs, options = {}) => {
    const client = getClient();

    const {
        concurrencyLimit = CONCURRENCY_LIMIT,
        retryLimit = RETRY_LIMIT,
        attributes = null, // Accept attributes to fetch
    } = options;

    // Split the keys into batches of MAX_BATCH_GET_SIZE
    const batches = chunkArray(keyPairs, MAX_BATCH_GET_SIZE);

    // Initialize p-limit with the specified concurrency limit
    const limit = pLimit(concurrencyLimit);

    // Shared array to collect all retrieved items
    const allItems = [];
    // Shared array to collect any errors
    const allErrors = [];

    /**
     * Fetches a single batch of items, handling retries for unprocessed keys.
     * @param {Array} batch - Array of key objects for BatchGetItem.
     * @param {number} attempt - Current retry attempt.
     * @returns {Promise<void>}
     */
    const fetchBatch = async (batch, attempt = 1) => {
        const params = {
            RequestItems: {
                [TABLE_NAME]: {
                    Keys: batch,
                    // Add ProjectionExpression and ExpressionAttributeNames if attributes are provided
                    ...(attributes && {
                        ProjectionExpression: attributes.map((attr, idx) => `#attr${idx}`).join(', '),
                        ExpressionAttributeNames: attributes.reduce((acc, attr, idx) => {
                            acc[`#attr${idx}`] = attr;
                            return acc;
                        }, {})
                    })
                }
            },
            ReturnConsumedCapacity: "TOTAL",
        };

        try {
            const response = await client.send(new BatchGetCommand(params));
            const retrievedItems = response.Responses[TABLE_NAME] || [];
            allItems.push(...retrievedItems);

            // Check for UnprocessedKeys
            const unprocessedKeys = response.UnprocessedKeys && response.UnprocessedKeys[TABLE_NAME]
                ? response.UnprocessedKeys[TABLE_NAME].Keys
                : [];

            if (unprocessedKeys.length > 0) {
                if (attempt <= retryLimit) {
                    console.warn(`BatchGetItem: Attempt ${attempt} - Retrying ${unprocessedKeys.length} unprocessed keys.`);
                    // Calculate exponential backoff with jitter
                    const delay = BACKOFF_BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 100;
                    await sleep(delay);
                    // Retry the unprocessed keys
                    await fetchBatch(unprocessedKeys, attempt + 1);
                } else {
                    console.error(`BatchGetItem: Attempt ${attempt} - Failed to process ${unprocessedKeys.length} keys.`);
                    allErrors.push({
                        batch: unprocessedKeys,
                        error: `Failed to retrieve ${unprocessedKeys.length} items after ${retryLimit} retries.`,
                    });
                }
            }
        } catch (error) {
            console.error(`BatchGetItem: Attempt ${attempt} - Error fetching batch:`, error);
            if (attempt <= retryLimit) {
                console.warn(`BatchGetItem: Attempt ${attempt} - Retrying due to error.`);
                // Calculate exponential backoff with jitter
                const delay = BACKOFF_BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 100;
                await sleep(delay);
                // Retry the same batch
                await fetchBatch(batch, attempt + 1);
            } else {
                console.error(`BatchGetItem: Attempt ${attempt} - Failed to fetch batch due to error.`);
                allErrors.push({
                    batch,
                    error: error.message || 'Unknown error',
                });
            }
        }
    };

    // Create an array of promise-returning functions with concurrency control
    const promises = batches.map(batch => limit(() => fetchBatch(batch)));

    // Execute all batch fetches
    await Promise.all(promises);

    if (allErrors.length > 0) {
        return { success: false, error: allErrors };
    }

    return { success: true, data: allItems };
};



// Put an item in the table with condition
const putItem = async (item) => {
    const client = getClient()
    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)', // Ensure both pk and sk are unique
    };

    try {
        await client.send(new PutCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB PutItem Error:', error);
        return { success: false, error };
    }
};

// Get an item by pk and sk
const getItem = async (pkVal, skVal=null) => {
    const client = getClient()

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal },
    };

    if (skVal) {
        params.Key.sk = skVal;
    }

    try {
        const data = await client.send(new GetCommand(params));
        if (!data || !data.Item) {
            return { success: false, error: 'Item not found' };
        }
        return { success: true, data: data.Item };
    } catch (error) {
        console.error('DynamoDB GetItem Error:', error);
        return { success: false, error: 'Failed to retrieve item' };
    }
};

// Generic Query function that accepts params for flexibility
const queryItems = async (params) => {
    const client = getClient(); // Initialize the DynamoDB client

    const queryParams = {
        TableName: TABLE_NAME, // Ensure the table name is always included
        ...params, // Spread any additional params passed to the function
    };

    try {
        const data = await client.send(new QueryCommand(queryParams));
        const hasMore = !!data?.LastEvaluatedKey;

        return {
            success: true,
            data: data.Items,
            lastEvaluatedKey: data.LastEvaluatedKey || null,
            hasMore: hasMore
        };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};


const queryItemsWithPkAndSk = async (pkValue, skPrefix = null, attributesToGet = []) => {
    const client = getClient();
    let params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pkValue',
        ExpressionAttributeValues: {
            ':pkValue': pkValue,
        },
        ProjectionExpression: attributesToGet.length > 0 ? attributesToGet.join(', ') : undefined,

    };

    if (skPrefix) {
        params.KeyConditionExpression += ' AND begins_with(sk, :skPrefix)';
        params.ExpressionAttributeValues[':skPrefix'] = skPrefix;
    }

    let items = [];
    let lastEvaluatedKey = null;

    try {
        do {
            if (lastEvaluatedKey) {
                params.ExclusiveStartKey = lastEvaluatedKey;
            }

            const data = await client.send(new QueryCommand(params));
            items = items.concat(data.Items);

            lastEvaluatedKey = data.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        return { success: true, data: items };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};





// Delete an item by pk and sk
const deleteItem = async (pk, sk) => {
    const client = getClient()

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pk, sk: sk },
    };

    try {
        await client.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB DeleteItem Error:', error);
        return { success: false, error };
    }
};

// Scan items in the table
const scanItems = async () => {
    const client = getClient()

    const params = {
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(pk, :pkPrefix)',
        ExpressionAttributeValues: { ':pkPrefix': 'V' },
    };

    try {
        const data = await client.send(new ScanCommand(params));
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB ScanItems Error:', error);
        return { success: false, error };
    }
};

// Query vendors using a GSI







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
        while (items.length > 0) {
            const batch = items.slice(0, 25);  // Take up to 25 items
            if (batch.length > 0) {  // Only push non-empty batches
                batches.push(batch);
            }
            items = items.slice(25);  // Remove the processed batch from items
        }

        const batchPromises = batches.map(async (batch, index) => {
            if (!batch || batch.length === 0) return;  // skip empty or undefined batches

            // Log and validate each batch before sending it to DynamoDB
            console.log(`Processing batch ${index + 1} with ${batch.length} items`);

            // Validate items in the batch to ensure no invalid values
            const validatedBatch = batch.map(item => {
                if (!validateItem(item, operationType)) {  // Custom validation function for Put/Delete
                    throw new Error(`Invalid item found in batch ${index + 1}`);
                }

                if (operationType === 'Put') {
                    return {
                        PutRequest: { Item: item },
                    };
                } else if (operationType === 'Delete') {
                    return {
                        DeleteRequest: {
                            Key: {
                                pk: item.pk,
                                sk: item.sk,
                            },
                        },
                    };
                }
            });

            const client = getClient()

            const params = {
                RequestItems: {
                    [TABLE_NAME]: validatedBatch,
                },
            };

            let response;
            try {
                response = await client.send(new BatchWriteCommand(params));
            } catch (error) {
                console.error(`Error processing ${operationType} batch ${index + 1}:`, error);
                errors.push({ batch, error });
                return;  // Continue with the next batch even if this one fails
            }

            // Handle unprocessed items
            const unprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];
            if (unprocessed.length > 0) {
                unprocessedItems.push(...unprocessed);
            }

            const successfullyProcessed = batch.length - unprocessed.length;
            added.push(...batch.slice(0, successfullyProcessed));

            console.log(`Batch ${index + 1}: Successfully processed ${successfullyProcessed} items.`);
        });

        await Promise.all(batchPromises);

        // Retry unprocessed items
        if (unprocessedItems.length > 0) {
            console.log(`Retrying ${unprocessedItems.length} unprocessed items...`);
            const retryResult = await retryUnprocessedItems(unprocessedItems, operationType, MAX_RETRIES);

            if (retryResult.success) {
                added.push(...retryResult.added);
                const failedRetryItems = retryResult.errors.map(item => ({
                    sku: item.vendor_sku,
                    error: 'Retry failed'
                }));
                errors.push(...failedRetryItems);
                // errors.push(...retryResult.errors);
            }
        }
        const hasErrors = errors.length > 0 || unprocessedItems.length > 0;
        return {
            success: true,
            results: {
                added,
                unprocessedItems,
                errors,
            },
        };

        //return { success: true, results: { added, unprocessedItems, errors } };
    } catch (error) {
        console.error(`DynamoDB batch ${operationType.toLowerCase()} error:`, error);
        return { success: false, error };
    }
};

// Custom validation function for checking invalid attributes
const validateItem = (item, operationType) => {
    return true;

};



// Retry function with exponential backoff for unprocessed items
const retryUnprocessedItems = async (unprocessedItems, operationType, retriesLeft) => {
    if (retriesLeft === 0) {
        console.error('Max retries reached. Some items could not be processed.');
        return { success: false, added: [], errors: unprocessedItems };
    }

    const delay = BASE_DELAY_MS * Math.pow(2, MAX_RETRIES - retriesLeft); // Exponential backoff

    console.log(`Retrying ${unprocessedItems.length} unprocessed items in ${delay} ms...`);

    // Wait for the backoff delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    let added = [];
    let stillUnprocessed = [];

    // Batch unprocessed items into groups of 25
    const batches = [];
    while (unprocessedItems.length > 0) {
        const batch = unprocessedItems.slice(0, 25);  // Create a batch of up to 25 items
        batches.push(batch);
        unprocessedItems = unprocessedItems.slice(25);  // Remove processed batch from unprocessedItems
    }
    const client = getClient()


    // Process each batch
    for (const batch of batches) {
        const params = {
            RequestItems: {
                [TABLE_NAME]: batch || [],  // Safeguard against undefined batch
            },
        };

        try {
            const response = await client.send(new BatchWriteCommand(params));
            const batchUnprocessed = response.UnprocessedItems?.[TABLE_NAME] || [];

            const successfullyProcessed = batch.length - batchUnprocessed.length;
            added.push(...batch.slice(0, successfullyProcessed));

            if (batchUnprocessed.length > 0) {
                stillUnprocessed.push(...batchUnprocessed);
            }
        } catch (error) {
            console.error(`Error retrying unprocessed ${operationType} items in batch:`, error);
            stillUnprocessed.push(...batch);  // If the batch fails, consider all items unprocessed
        }
    }

    // If there are still unprocessed items, retry again with the remaining retries
    if (stillUnprocessed.length > 0) {
        console.log(`Still ${stillUnprocessed.length} unprocessed items, retrying...`);
        const retryResult = await retryUnprocessedItems(stillUnprocessed, operationType, retriesLeft - 1);
        added.push(...retryResult.added);  // Collect retried successfully processed items
        stillUnprocessed = retryResult.errors;  // Collect any remaining errors
    }

    return { success: stillUnprocessed.length === 0, added, errors: stillUnprocessed };
};


const queryItemCount = async (pkValue, skPrefix = null) => {
    let totalCount = 0;
    let lastEvaluatedKey = null;
    const client = getClient()

    do {
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pkValue',
            ExpressionAttributeValues: {
                ':pkValue': pkValue,
            },
            Select: 'COUNT', // Only returns the count of matching items
        };

        // Only include ExclusiveStartKey if it's defined (for pagination)
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        // Add the sort key prefix condition if skPrefix is provided
        if (skPrefix) {
            params.KeyConditionExpression += ' AND begins_with(sk, :skPrefix)';
            params.ExpressionAttributeValues[':skPrefix'] = skPrefix;
        }

        try {
            // Perform the query
            const data = await client.send(new QueryCommand(params));

            // Safely accumulate the count (ensure Count is defined)
            totalCount += data.Count || 0;

            // Set lastEvaluatedKey for pagination (ensure LastEvaluatedKey is handled correctly)
            lastEvaluatedKey = data.LastEvaluatedKey || null; // Set to null if not returned

        } catch (error) {
            console.error('DynamoDB QueryItemCount Error:', error);
            return { success: false, error };
        }

    } while (lastEvaluatedKey); // Continue querying if there are more pages

    // Return the accumulated count
    return { success: true, count: totalCount };
};

const updateItem = async (pkVal, skVal, updatedFields, expressionAttributeNames) => {
    const client = getClient();

    let UpdateExpression = 'SET';
    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = expressionAttributeNames || {};

    Object.entries(updatedFields).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;

        // Append the attribute and value to the update expression
        UpdateExpression += ` ${attrName} = ${attrValue},`;
        ExpressionAttributeValues[attrValue] = value;
        ExpressionAttributeNames[attrName] = key;
    });

    // Remove trailing comma from the UpdateExpression
    UpdateExpression = UpdateExpression.slice(0, -1);

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal, sk: skVal },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        ReturnValues: 'ALL_NEW',  // Optionally return all new attributes after update
    };

    try {
        const data = await client.send(new UpdateCommand(params));
        return { success: true, data: data.Attributes };
    } catch (error) {
        console.error('DynamoDB UpdateItem Error:', error);
        return { success: false, error };
    }
};

/**
 * Appends values to an existing list attribute (e.g., history), or creates the attribute if it doesn't exist.
 * @param {string} pkVal - Partition key value
 * @param {string} skVal - Sort key value
 * @param {Object} listAppendFields - Fields to append to existing lists (for cases like appending history)
 * @param {Object} expressionAttributeNames - Optional expression attribute names (for reserved keywords)
 */
const updateOrInsert = async (pkVal, skVal, listAppendFields = {}, expressionAttributeNames = {}) => {
    const client = getClient();

    let UpdateExpression = 'SET';
    const ExpressionAttributeValues = {};

    // Process list append fields (for attributes like history that need to append)
    Object.entries(listAppendFields).forEach(([key, value], index) => {
        const attrName = expressionAttributeNames[`#appendAttr${index}`] || `#${key}`;
        const attrValue = `:appendVal${index}`;

        UpdateExpression += ` ${attrName} = list_append(if_not_exists(${attrName}, :empty_list), ${attrValue}),`;
        ExpressionAttributeValues[attrValue] = value;
        ExpressionAttributeValues[':empty_list'] = [];  // Provide an empty list if the attribute doesn't exist
        expressionAttributeNames[attrName] = key;
    });

    // Remove trailing comma from the UpdateExpression
    UpdateExpression = UpdateExpression.slice(0, -1);

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal, sk: skVal },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',  // Optionally return all new attributes after the update
    };

    try {
        const data = await client.send(new UpdateCommand(params));
        return { success: true, data: data.Attributes };
    } catch (error) {
        console.error('DynamoDB updateOrInsert Error:', error);
        return { success: false, error };
    }

};

// Execute a DynamoDB transaction
const transactWriteItems = async (transactionItems) => {
    const client = getClient();

    // Map through each TransactItem and add TableName if not present
    const updatedTransactionItems = transactionItems.map(item => {
        // Extract the operation (e.g., 'Put', 'Update', 'Delete')
        const operation = Object.keys(item)[0];
        const operationParams = item[operation];

        // Add TableName if not present

        operationParams.TableName = TABLE_NAME;


        return {
            [operation]: operationParams
        };
    });

    const params = {
        TransactItems: updatedTransactionItems,
    };

    try {
        await client.send(new TransactWriteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB TransactWrite Error:', error);
        return { success: false, error };
    }
};

const updateItemIfExists = async (pkVal, skVal, updatedFields, expressionAttributeNames) => {
    const client = getClient();

    let UpdateExpression = 'SET';
    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = expressionAttributeNames || {};

    Object.entries(updatedFields).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;

        // Append the attribute and value to the update expression
        UpdateExpression += ` ${attrName} = ${attrValue},`;
        ExpressionAttributeValues[attrValue] = value;
        ExpressionAttributeNames[attrName] = key;
    });

    // Remove trailing comma from the UpdateExpression
    UpdateExpression = UpdateExpression.slice(0, -1);

    // Add ConditionExpression to ensure the item exists
    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal, sk: skVal },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        ReturnValues: 'ALL_NEW', // Optionally return all new attributes after update
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)', // Ensure the item exists
    };

    try {
        const data = await client.send(new UpdateCommand(params));
        return { success: true, data: data.Attributes };
    } catch (error) {
        console.error('DynamoDB UpdateItem Error:', error);
        if (error.name === 'ConditionalCheckFailedException') {
            // Handle item not existing
            return { success: false, error: new Error('Item does not exist') };
        }
        return { success: false, error };
    }
};
/**
 * Deletes an item from DynamoDB based on the provided partition key (pk) and sort key (sk).
 *
 * @param {string} pkVal - The value of the partition key.
 * @param {string} skVal - The value of the sort key.
 * @returns {Promise<{ success: boolean, error?: Error }>}
 */
const deleteItemWithPkAndSk = async (pkVal, skVal) => {
    const client = getClient(); // Initialize your DynamoDB DocumentClient

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal, sk: skVal },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)', // Ensure the item exists
    };

    try {
        await client.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB DeleteItem Error:', error);

        if (error.name === 'ConditionalCheckFailedException') {
            // The item does not exist
            return { success: false, error: 'Item does not exist' };
        }

        // Handle other potential errors
        return { success: false, error };
    }
};






export {
    putItem,
    getItem,
    updateItem,
    queryItems,
    deleteItem,
    scanItems,
    batchWriteItems,
    deleteItemBatch,
    queryItemCount,
    updateOrInsert,
    transactWriteItems,
    queryItemsWithPkAndSk,
    updateItemIfExists,
    deleteItemWithPkAndSk,
    batchGetItems
};


