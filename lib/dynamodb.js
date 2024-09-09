import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // For DynamoDB operations
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"; // For DocumentClient operations

const TABLE_NAME = '3pl-v2'; // Replace with your actual table name

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

// Put items in batch
const putItemBatch = async (items) => {
    try {
        const added = [];
        const duplicates = [];
        const errors = [];

        const batches = [];
        while (items.length) {
            batches.push(items.splice(0, 25)); // DynamoDB allows up to 25 items per batch write
        }

        const batchPromises = batches.map(async (batch) => {
            const params = {
                RequestItems: {
                    [TABLE_NAME]: batch.map((item) => ({
                        PutRequest: {
                            Item: item,
                        },
                    })),
                },
            };

            try {
                const response = await dynamoDocClient.send(new BatchWriteCommand(params));
                const unprocessedItems = response.UnprocessedItems?.[TABLE_NAME] || [];

                const processedItems = batch.filter(
                    (item) => !unprocessedItems.some((unprocessed) => unprocessed.PutRequest.Item.SK === item.SK)
                );

                added.push(...processedItems);

                if (unprocessedItems.length > 0) {
                    unprocessedItems.forEach((unprocessed) => {
                        const product = batch.find((item) => item.SK === unprocessed.PutRequest.Item.SK);
                        duplicates.push(product);
                    });
                }

            } catch (err) {
                console.error('Error processing batch:', err);
                batch.forEach((item) => errors.push(item));
            }
        });

        await Promise.all(batchPromises);

        return { success: true, results: { added, duplicates, errors } };
    } catch (error) {
        console.error('DynamoDB batch write error:', error);
        return { success: false, error };
    }
};

const deleteItemBatch = async (items) => {
    try {
      const batches = [];
      const unprocessedItems = [];
      let totalDeleted = 0; // Keep track of total deleted items
  
      while (items.length) {
        batches.push(items.splice(0, 25)); // DynamoDB allows up to 25 items per batch delete
      }
  
      const batchPromises = batches.map(async (batch, index) => {
        const params = {
          RequestItems: {
            [TABLE_NAME]: batch.map((item) => ({
              DeleteRequest: {
                Key: {
                  PK: item.PK,
                  SK: item.SK,
                },
              },
            })),
          },
        };
  
        let response;
        try {
          response = await dynamoDocClient.send(new BatchWriteCommand(params));
        } catch (error) {
          console.error(`Error processing batch ${index + 1}:`, error);
          return { success: false, error };
        }
  
        // Log how many items were successfully deleted
        const successfullyDeleted = batch.length - (response.UnprocessedItems?.[TABLE_NAME]?.length || 0);
        totalDeleted += successfullyDeleted;
        console.log(`Batch ${index + 1}: Successfully deleted ${successfullyDeleted} items.`);
  
        // Handle unprocessed items, and retry until empty
        if (response.UnprocessedItems && response.UnprocessedItems[TABLE_NAME]) {
          unprocessedItems.push(...response.UnprocessedItems[TABLE_NAME]);
          console.log(`Batch ${index + 1}: Unprocessed ${response.UnprocessedItems[TABLE_NAME].length} items.`);
        }
      });
  
      await Promise.all(batchPromises);
  
      // Retry unprocessed items
      if (unprocessedItems.length > 0) {
        console.log(`Retrying ${unprocessedItems.length} unprocessed items...`);
        await retryUnprocessedItems(unprocessedItems);
      }
  
      console.log(`Total deleted items: ${totalDeleted}`);
      return { success: true, totalDeleted };
    } catch (error) {
      console.error('DynamoDB batch delete error:', error);
      return { success: false, error };
    }
  };
  
  // Retry unprocessed items function
  const retryUnprocessedItems = async (unprocessedItems) => {
    const retries = [];
    let retriedCount = 0;
  
    for (let item of unprocessedItems) {
      try {
        const params = {
          RequestItems: {
            [TABLE_NAME]: [{
              DeleteRequest: {
                Key: {
                  PK: item.DeleteRequest.Key.PK,
                  SK: item.DeleteRequest.Key.SK,
                },
              },
            }],
          },
        };
        retries.push(dynamoDocClient.send(new BatchWriteCommand(params)));
        retriedCount++;
      } catch (error) {
        console.error('Error retrying unprocessed items:', error);
      }
    }
  
    await Promise.all(retries);
    console.log(`Retried ${retriedCount} unprocessed items.`);
  };
  


export { putItem, getItem, queryItems, deleteItem, scanItems, putItemBatch, queryVendorsUsingGSI , deleteItemBatch};
