'use server'
import { getProductById, getProductByVendorSku } from '@/services/data/product';
import { generateShipmentId } from '@/services/utils';
import { transactWriteItems, putItem, batchWriteItems, queryItems, queryItemsWithPkAndSk, getItem, deleteItemWithPkAndSk, batchGetItems } from '@/services/external/dynamo/wrapper';
import { cleanResponseData } from '@/services/utils';
import { getLoggedInUser } from '@/app/actions';

export async function createStockShipment(vendorId, stockShipmentItems) {
    try {
        // Second-tier validation: Check if vendor_sku exists in the database
        const invalidItems = [];
        const validItems = [];
        const user = getLoggedInUser()

        for (const item of stockShipmentItems) {
            const { vendor_sku } = item;

            // Fetch the existing product by vendor_sku
            const result = await getProductById(vendorId, vendor_sku);
            const product = result?.data || null
            if (!product) {
                invalidItems.push({
                    item: vendor_sku,
                    error: `Product with SKU ${vendor_sku} not found in the system`,
                });
            } else if (product && product.status?.toLowerCase() !== 'active') {
                invalidItems.push({
                    item: vendor_sku,
                    error: `Product with SKU ${vendor_sku} is not active`,
                });
            } else {
                validItems.push(item);
            }
        }

        if (invalidItems.length > 0) {
            return {
                success: false,
                error: 'Some items could not be found, please correct or remove these',
                invalidItems,
            };
        }

        // All validations passed, proceed to create the StockShipment
        const shipmentId = generateShipmentId(vendorId);
        const createdAt = new Date().toISOString();

        // Prepare the StockShipment entry
        const stockShipmentItem = {
            pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
            sk: `STOCKSHIPMENT#${shipmentId}`,
            entity_type: 'StockShipment',
            shipment_id: shipmentId,
            vendor_id: vendorId,
            status: 'Submitted',
            created_at: createdAt,
            updated_at: createdAt,
        };

        // Use putItem to insert the StockShipment entry with condition to prevent overwriting
        const putShipmentResult = await putItem(stockShipmentItem);

        if (!putShipmentResult.success) {
            console.error('Failed to create StockShipment:', putShipmentResult.error);
            return {
                success: false,
                error: 'Failed to create stock shipment',
                details: putShipmentResult.error.message,
            };
        }

        // Prepare the StockShipmentItem entries
        const itemsToPut = [];

        for (const item of validItems) {
            const itemId = item.vendor_sku;

            const shipmentItemEntry = {
                pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                sk: `STOCKSHIPMENT#${shipmentId}#STOCKSHIPMENTITEM#${itemId}`,
                entity_type: 'StockShipmentItem',
                shipment_id: shipmentId,
                vendor_sku: itemId,
                stock_in: item.stock_in,
                created_at: createdAt,
                updated_at: createdAt,
                modified_by: user?.email || 'API TOKEN'
            };
            itemsToPut.push(shipmentItemEntry);
        }

        // Use batchWriteItems to add the StockShipmentItem entries
        const batchWriteResult = await batchWriteItems(itemsToPut, 'Put');

        if (!batchWriteResult.success) {
            console.error('Batch write failed:', batchWriteResult.error);
            return {
                success: false,
                error: 'Failed to create stock shipment items',
                details: batchWriteResult.error.message,
            };
        }

        // Handle any errors or unprocessed items
        const errors = [];
        if (batchWriteResult.results.errors.length > 0) {
            errors.push(...batchWriteResult.results.errors);
        }

        if (batchWriteResult.results.unprocessedItems.length > 0) {
            errors.push(
                ...batchWriteResult.results.unprocessedItems.map((item) => ({
                    item: item.PutRequest.Item.vendor_sku || 'Unknown SKU',
                    error: 'Unprocessed item during batch write',
                }))
            );
        }

        if (errors.length > 0) {
            return {
                success: false,
                error: 'Failed to create some stock shipment items',
                invalidItems: errors,
            };
        }

        // Return success response
        return {
            success: true,
            shipment_id: shipmentId,
            message: 'Stock shipment created successfully',
        };
    } catch (error) {
        console.error('Unhandled error in createStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function updateStockShipment(vendorId, stockShipmentId, stockShipmentItems) {
    try {


        // Step 2: Validate the new items
        const invalidItems = [];
        const validItems = [];

        for (const item of stockShipmentItems) {
            const { vendor_sku } = item;

            // Fetch the existing product by vendor_sku
            const result = await getProductByVendorSku(vendorId, vendor_sku);
            if (!result.success || !result.data || result.data.length === 0) {
                invalidItems.push({
                    item: vendor_sku,
                    error: `Product with SKU ${vendor_sku} not found in the system`,
                });
            } else {
                validItems.push(item);
            }
        }

        if (invalidItems.length > 0) {
            return {
                success: false,
                error: 'Some items could not be found, please correct or remove these',
                invalidItems,
            };
        }

        // Step 3: Prepare DynamoDB transaction items

        // Fetch existing shipment items to delete
        const existingItemsResponse = await searchIndex(
            {
                bool: {
                    must: [
                        { term: { 'entity_type.keyword': 'StockShipmentItem' } },
                        { term: { 'vendor_id.keyword': vendorId } },
                        { term: { 'shipment_id.keyword': stockShipmentId } },
                    ],
                },
            },
            {},
            0,
            1000 // Adjust size as needed
        );

        const existingItemsHits = existingItemsResponse.hits.hits || [];
        const existingItemKeys = existingItemsHits.map((hit) => {
            const item = hit._source;
            return {
                pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                sk: `STOCKSHIPMENTITEM#${item.vendor_sku}`,
            };
        });

        const transactionItems = [];

        // Add Delete requests for existing items
        for (const key of existingItemKeys) {
            transactionItems.push({
                Delete: {
                    Key: key,
                },
            });
        }

        // Add Put requests for new items
        const updatedAt = new Date().toISOString();

        for (const item of validItems) {
            const itemEntry = {
                Put: {
                    Item: {
                        pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                        sk: `STOCKSHIPMENTITEM#${item.vendor_sku}`,
                        entity_type: 'StockShipmentItem',
                        vendor_id: vendorId,
                        shipment_id: stockShipmentId,
                        vendor_sku: item.vendor_sku,
                        quantity: item.quantity,
                        updated_at: updatedAt,
                    },
                },
            };
            transactionItems.push(itemEntry);
        }

        // Optionally update the StockShipment entity's metadata (e.g., updated_at)
        const shipmentUpdate = {
            Put: {
                Item: {
                    pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
                    sk: `STOCKSHIPMENT#${stockShipmentId}`,
                    entity_type: 'StockShipment',
                    shipment_id: stockShipmentId,
                    vendor_id: vendorId,
                    updated_at: updatedAt,
                    // Include other fields as needed
                },
            },
        };
        transactionItems.push(shipmentUpdate);

        // Step 4: Execute the transaction
        const transactionResult = await transactWriteItems(transactionItems);

        if (!transactionResult.success) {
            console.error('Transaction failed:', transactionResult.error);
            return {
                success: false,
                error: 'Failed to update stock shipment',
                details: transactionResult.error.message,
            };
        }

        // Return success response
        return {
            success: true,
            shipment_id: stockShipmentId,
            message: 'Stock shipment updated successfully',
        };
    } catch (error) {
        console.error('Unhandled error in updateStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

/*export async function getStockShipmentDetails(vendorId, stockShipmentId) {
    const shipmentData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENT#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}`)
    const shipment = shipmentData?.data || null


    const shipmentItemsData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENTITEM#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#`)

    const shipmentItems = shipmentItemsData?.data || null

    if (!shipment) {
        return { success: false, error: 'No stock shipment found' };
    }
    if (!shipmentItems) {
        return { success: false, error: 'No stock shipment items found' };
    }

    const vendorSkus = shipmentItems.map((hit) => hit.vendor_sku);
    const uniqueVendorSkus = [...new Set(vendorSkus)];
    const productDataMap = {};
    for (const sku of uniqueVendorSkus) {
        const product = await getProductById(vendorId, sku);

        const productDetails = {
            name: product.data.name,
            image: product.data.image,
            brand_name: product.data.brand_name,
            attributes: product.data.attributes
        };

        // Conditionally add the warehouse object if it exists
        if (product.data.warehouse) {
            productDetails.warehouse = product.data.warehouse;
        }

        productDataMap[product.data.vendor_sku] = productDetails;
    }
    const stockShipmentItems = shipmentItems.map((item) => {

        const productInfo = productDataMap[item.vendor_sku] || {};
        const cleanShipmentItemData = cleanResponseData(item)
        return {
            vendor_sku: item.vendor_sku,
            ...cleanShipmentItemData,
            ...productInfo,
        };
    });

    const [shipmentObj] = shipment
    const cleanShipment = cleanResponseData(shipmentObj)
    cleanShipment.items = stockShipmentItems
    // Return the final data in the desired format
    return {
        success: true,
        data: cleanShipment//{ stock_shipment: shipment, stock_shipment_items: stockShipmentItems }, // Shipment items as data
    };

}*/

export async function getStockShipmentDetails(vendorId, stockShipmentId) {
    // Fetch the shipment data
    const shipmentData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENT#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}`);
    const shipment = shipmentData?.data || null;

    // Fetch the shipment items data
    const shipmentItemsData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENTITEM#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#`);
    const shipmentItems = shipmentItemsData?.data || null;

    if (!shipment) {
        return { success: false, error: 'No stock shipment found' };
    }
    if (!shipmentItems) {
        return { success: false, error: 'No stock shipment items found' };
    }

    const vendorSkus = shipmentItems.map((hit) => hit.vendor_sku);
    const uniqueVendorSkus = [...new Set(vendorSkus)];

    // Build keyPairs for batch fetching
    const keyPairs = uniqueVendorSkus.map((sku) => ({
        pk: `VENDORPRODUCT#${vendorId}`,
        sk: `PRODUCT#${sku}`,
    }));

    // Attributes to fetch
    const attributesToFetch = ['vendor_sku', 'name', 'image', 'brand_name', 'attributes', 'warehouse'];

    // Fetch products in batch
    const batchResult = await batchGetItems(keyPairs, { attributes: attributesToFetch });

    if (!batchResult.success) {
        return { success: false, error: 'Failed to fetch product data' };
    }

    const products = batchResult.data;

    // Build a map of products for quick lookup
    const productDataMap = {};
    for (const product of products) {
        const productDetails = {
            name: product.name,
            image: product.image,
            brand_name: product.brand_name,
            attributes: product.attributes,
        };

        // Conditionally add the warehouse object if it exists
        if (product.warehouse) {
            productDetails.warehouse = product.warehouse;
        }

        productDataMap[product.vendor_sku] = productDetails;
    }

    // Map shipment items with their corresponding product details
    const stockShipmentItems = shipmentItems.map((item) => {
        const productInfo = productDataMap[item.vendor_sku] || {};
        const cleanShipmentItemData = cleanResponseData(item);
        return {
            vendor_sku: item.vendor_sku,
            ...cleanShipmentItemData,
            ...productInfo,
        };
    });

    const [shipmentObj] = shipment;
    const cleanShipment = cleanResponseData(shipmentObj);
    cleanShipment.items = stockShipmentItems;

    // Return the final data
    return {
        success: true,
        data: cleanShipment,
    };
}
export const getAllStockShipments = async (vendorId, pageSize = 25, exclusiveStartKey = null) => {
    const pkVal = `VENDORSTOCKSHIPMENT#${vendorId}`;
    const params = {
        KeyConditionExpression: 'pk = :pkVal',
        ExpressionAttributeValues: {
            ':pkVal': pkVal,
        },
        Limit: pageSize,
    };

    if (exclusiveStartKey) {
        params.ExclusiveStartKey = exclusiveStartKey;
    }

    try {
        const result = await queryItems(params);
        if (result.success) {
            const hasMore = !!result.lastEvaluatedKey;
            // Loop over each item in result.data and get the shipment items
            const dataWithShipmentItems = await Promise.all(result.data.map(async (shipment) => {
                const shipmentItemsResult = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENTITEM#${shipment.vendor_id}`, `STOCKSHIPMENT#${shipment.shipment_id}#STOCKSHIPMENTITEM#`)
                shipment.items = cleanResponseData(shipmentItemsResult.data);
                return shipment;
            }));
            return {
                success: true,
                data: cleanResponseData(dataWithShipmentItems),
                hasMore: hasMore,
                lastEvaluatedKey: result.lastEvaluatedKey,
            };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Error retrieving stock shipments:', error);
        return { success: false, error: 'Failed to retrieve stockshipments' };
    }
};


export async function getStockShipmentById(vendorId, stockShipmentId) {
    const data = await getItem(`VENDORSTOCKSHIPMENT#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}`);
    if (data.success && data.data) {
        data.data = cleanResponseData(data.data)
    }
    return data;
}
export async function checkShipmentExists(vendorId, stock_shipment_id) {
    const shipmentData = await getStockShipmentById(vendorId, stock_shipment_id);
    return shipmentData.success && shipmentData.data;
}
export async function deleteStockShipmentWithItems(vendorId, stockShipmentId) {
    //check if the shipment exists
    const check = await checkShipmentExists(vendorId, stockShipmentId)
    const errorItems = []
    if (check) {
        //get all the shipmentites for this shipment and prep delete
        const stockShipmentItemsData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENTITEM#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#`)
        const existingItems = stockShipmentItemsData.data
        for (const item of existingItems) {

            const res = await deleteItemWithPkAndSk(item.pk, item.sk)
            if (!res.success) {
                const skParts = item.sk.split('#');
                const vendorSku = skParts[skParts.length - 1]; // Extract the vendor_sku part
                errorItems.push({ error: res.error, item: vendorSku })
            }
        }
        if (errorItems.length > 0) {
            return { success: false, error: errorItems }
        }
        // now remove the stockshipment entry 
        const delResponse = await deleteItemWithPkAndSk(`VENDORSTOCKSHIPMENT#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}`)
        if (delResponse.success) {
            return { success: true }
        }
        return { success: false, error: delResponse.error }
    } else {
        return { success: false, error: 'Stock Shipment not found' }
    }
    //prepare the bulk delete 
}

export async function updateStockShipmentAsReceived(vendorId, stockShipmentId, emailOrApiToken) {
    const updatedAt = new Date().toISOString();
    const modifiedBy = emailOrApiToken?.email || 'API TOKEN'

    try {
        // Begin building the transaction
        let transactionItems = [];

        // Update the stock shipment's 'received_at' field
        transactionItems.push({
            Update: {
                Key: {
                    pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
                    sk: `STOCKSHIPMENT#${stockShipmentId}`,
                },
                UpdateExpression: 'SET received_at = :receivedAt, updated_at = :updatedAt',
                ExpressionAttributeValues: {
                    ':receivedAt': updatedAt,
                    ':updatedAt': updatedAt,
                },
            },
        });

        // Fetch all shipment items for the stock shipment
        const shipmentItemsResult = await queryItemsWithPkAndSk(
            `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
            `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#`
        );

        if (!shipmentItemsResult.success) {
            return { success: false, error: shipmentItemsResult.error };
        }
        const shipmentItems = shipmentItemsResult.data;

        // Loop over each shipment item
        for (const item of shipmentItems) {
            const vendorSku = item.vendor_sku;
            const received = item.received || 0;
            const previousReceived = item.previous_received || 0;
            const adjustedReceived = received - previousReceived;

            if (adjustedReceived !== 0) {
                console.log('Condition number 1')
                // Adjust product stock
                transactionItems.push({
                    Update: {
                        Key: {
                            pk: `VENDORPRODUCT#${vendorId}`,
                            sk: `PRODUCT#${vendorSku}`,
                        },
                        UpdateExpression: 'SET stock_available = if_not_exists(stock_available, :zero) + :adjustment',
                        ExpressionAttributeValues: {
                            ':adjustment': adjustedReceived,
                            ':zero': 0,
                        },
                    },
                });

                // Update 'previous_received' to 'received' for the shipment item
                transactionItems.push({
                    Update: {
                        Key: {
                            pk: item.pk,
                            sk: item.sk,
                        },
                        UpdateExpression: 'SET previous_received = :received, updated_at = :updatedAt, modified_by = :modifiedBy',
                        ExpressionAttributeValues: {
                            ':received': received,
                            ':updatedAt': updatedAt,
                            ':modifiedBy': modifiedBy
                        },
                    },
                });
            }

            // Check if transactionItems length is approaching limit
            if (transactionItems.length === 25) {
                console.log('Condition number 2')
                // Execute the batch transaction
                const transactionResult = await transactWriteItems(transactionItems);
                if (!transactionResult.success) {
                    console.error('Batch transaction failed for stock shipment update');
                    const returnMessage = transactionResult.error.message || 'Transaction batch failed'
                    return JSON.stringify({ success: false, error: returnMessage });
                    // Reset transactionItems for the next batch
                    transactionItems = [];
                }
            }

            // Execute any remaining transaction items
            if (transactionItems.length > 0) {
                console.log('Condition number 3')
                const transactionResult = await transactWriteItems(transactionItems);
                console.log('transactionResult', transactionResult)
                if (!transactionResult.success) {
                    console.error('Final batch transaction failed for stock shipment update');
                    const returnMessage = transactionResult.error.message || 'Transaction batch failed'
                    return JSON.stringify({ success: false, error: returnMessage });
                }
            }

            const returnMessage = 'Stock shipment updated successfully'
            return JSON.stringify({ success: true, message: returnMessage });
        }
    }
    catch (error) {
        console.error('Stock shipment update failed');
        return { success: false, error: 'Server error', details: error.message };
    }
}



