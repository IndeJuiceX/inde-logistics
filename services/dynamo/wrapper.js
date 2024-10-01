// dynamoFunctions.js
import { getClient } from './client';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand, BatchWriteCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = '3pl-v3'; // Replace with your actual table name

// Put an item in the table with condition
const putItem = async (item) => {
    const client = getClient()
    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk)'
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
const getItem = async (pkVal, skVal) => {
    const client = getClient()

    const params = {
        TableName: TABLE_NAME,
        Key: { pk: pkVal, sk: skVal },
    };

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
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};




// Query items with optional sk prefix
/*const queryItems = async (pkValue, skPrefix = null) => {
    const client = getClient()

    let params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pkValue',
        ExpressionAttributeValues: {
            ':pkValue': pkValue,
        },
    };

    if (skPrefix) {
        params.KeyConditionExpression += ' AND begins_with(sk, :skPrefix)';
        params.ExpressionAttributeValues[':skPrefix'] = skPrefix;
    }

    try {
        const data = await client.send(new QueryCommand(params));
        return { success: true, data: data.Items };
    } catch (error) {
        console.error('DynamoDB QueryItems Error:', error);
        return { success: false, error };
    }
};*/

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
    if (operationType === 'Delete') {
        // Check for pk and sk in the item for delete operation
        if (!item.pk || !item.sk) {
            console.error(`Delete request missing pk or sk: ${JSON.stringify(item)}`);
            return false;
        }
    } else if (operationType === 'Put') {
        // For Put, check for any invalid values (nulls, empty strings, etc.)
        for (let key in item) {
            const value = item[key];

            if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                console.error(`Invalid attribute found for key ${key}: ${value}`);
                return false;  // Invalid item
            }
        }
    }
    return true;  // Valid item
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

//export { updateOrInsert };





export { putItem, getItem, updateItem, queryItems, deleteItem, scanItems, batchWriteItems, deleteItemBatch, queryItemCount, updateOrInsert };
