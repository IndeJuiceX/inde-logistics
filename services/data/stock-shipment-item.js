import { getProductById } from '@/services/data/product';
import { transactWriteItems, updateItem, batchWriteItems, updateItemIfExists, queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';
import { getStockShipmentDetails, getStockShipmentById, checkShipmentExists } from './stock-shipment';
import { getLoggedInUser } from '@/app/actions';

export async function addItemsToStockShipment(vendorId, stockShipmentId, stockShipmentItems) {
    try {
        // Step 1: Validate the new items
        const invalidItems = [];
        const validItems = [];
        const user = await getLoggedInUser()
        for (const item of stockShipmentItems) {
            const { vendor_sku } = item;

            // Fetch the existing product by vendor_sku
            const result = await getProductById(vendorId, vendor_sku);
            if (!result.success || !result.data) {
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


        // Step 4: Prepare items for batch write
        const itemsToPut = [];
        const createdAt = new Date().toISOString();

        for (const item of validItems) {
            const itemToPut = {
                pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                sk: `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#${item.vendor_sku}`,
                entity_type: 'StockShipmentItem',
                shipment_id: stockShipmentId,
                vendor_sku: item.vendor_sku,
                stock_in: item.stock_in,
                created_at: createdAt,
                updated_at: createdAt,
                modified_by: user?.email || 'API TOKEN'
            };
            itemsToPut.push(itemToPut);
        }

        // Step 5: Use batchWriteItems to add new items
        const batchWriteResult = await batchWriteItems(itemsToPut, 'Put');

        if (!batchWriteResult.success) {
            console.error('Batch write failed:', batchWriteResult.error);
            return {
                success: false,
                error: 'Failed to add items to stock shipment',
                details: batchWriteResult.error.message,
            };
        }

        // Handle any errors (duplicates or unprocessed items)
        const errors = [];
        if (batchWriteResult.results.errors.length > 0) {
            errors.push(...batchWriteResult.results.errors);
        }

        if (batchWriteResult.results.unprocessedItems.length > 0) {
            errors.push(
                ...batchWriteResult.results.unprocessedItems.map((item) => ({
                    item: item.PutRequest.Item.vendor_sku,
                    error: 'Unprocessed item',
                }))
            );
        }

        if (errors.length > 0) {
            return {
                success: false,
                error: 'Failed to add some items to stock shipment',
                invalidItems: errors,
            };
        }

        // Step 6: Update the StockShipment's updated_at field
        const updatedAt = createdAt; // Use the same timestamp
        const updateShipmentResult = await updateItem(
            `VENDORSTOCKSHIPMENT#${vendorId}`,
            `STOCKSHIPMENT#${stockShipmentId}`,
            { updated_at: updatedAt }
        );

        if (!updateShipmentResult.success) {
            console.error('Failed to update StockShipment item:', updateShipmentResult.error);
            return {
                success: false,
                error: 'Failed to update stock shipment metadata',
                details: updateShipmentResult.error.message,
            };
        }

        // Return success response
        return {
            success: true,
            shipment_id: stockShipmentId,
            message: 'Items added to stock shipment successfully',
        };
    } catch (error) {
        console.error('Unhandled error in addItemsToStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function removeItemsFromStockShipment(vendorId, stockShipmentId, vendorSkusToRemove) {
    try {

        const stockShipmentItemsData = await queryItemsWithPkAndSk(`VENDORSTOCKSHIPMENTITEM#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#`)

        const existingItems = stockShipmentItemsData.data
        // Step 2: Prepare items for batch delete
        const itemsToDelete = [];
        const invalidItems = []

        for (const sku of vendorSkusToRemove) {
            const skuExists = existingItems.some(item => item.vendor_sku === sku);

            if (skuExists) {
                const deleteItem = {
                    pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                    sk: `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#${sku}`,
                };
                itemsToDelete.push(deleteItem);
            } else {
                invalidItems.push({ item: sku, error: `Item with sku ${sku} does not exist in the stock shipment` })
            }

        }

        if (invalidItems.length > 0) {
            return {
                success: false,
                error: 'Failed to remove items from the Stock Shipment',
                details: invalidItems
            }
        }

        // Step 3: Use batchWriteItems to delete items
        const batchDeleteResult = await batchWriteItems(itemsToDelete, 'Delete');

        if (!batchDeleteResult.success) {
            console.error('Batch delete failed:', batchDeleteResult.error);
            return {
                success: false,
                error: 'Failed to remove items from stock shipment',
                details: batchDeleteResult.error.message,
            };
        }

        // Handle any errors
        const errors = [];
        if (batchDeleteResult.results.errors.length > 0) {
            errors.push(...batchDeleteResult.results.errors);
        }

        if (batchDeleteResult.results.unprocessedItems.length > 0) {
            errors.push(
                ...batchDeleteResult.results.unprocessedItems.map((item) => ({
                    item: item.DeleteRequest.Key.sk.replace(`STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#${item.vendor_sku}`, ''),
                    error: 'Unprocessed item during delete',
                }))
            );
        }

        if (errors.length > 0) {
            return {
                success: false,
                error: 'Failed to remove some items from stock shipment',
                invalidItems: errors,
            };
        }

        // Step 4: Update the StockShipment's updated_at field
        const updatedAt = new Date().toISOString();

        const updateShipmentResult = await updateItem(
            `VENDORSTOCKSHIPMENT#${vendorId}`,
            `STOCKSHIPMENT#${stockShipmentId}`,
            { updated_at: updatedAt }
        );

        if (!updateShipmentResult.success) {
            console.error('Failed to update StockShipment item:', updateShipmentResult.error);
            return {
                success: false,
                error: 'Failed to update stock shipment metadata',
                details: updateShipmentResult.error.message,
            };
        }

        // Return success response
        return {
            success: true,
            shipment_id: stockShipmentId,
            message: 'Items removed from stock shipment successfully',
        };
    } catch (error) {
        console.error('Unhandled error in removeItemsFromStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function updateItemsStockInStockShipment(
    vendorId,
    stockShipmentId,
    shipmentItemsToUpdate
) {
    try {
        const failedItems = [];
        const updatedAt = new Date().toISOString();
        const user = getLoggedInUser()
        // Loop over each shipment item to update
        for (const item of shipmentItemsToUpdate) {
            const { vendor_sku, stock_in } = item;

            // Construct primary key values
            const pkVal = 'VENDORSTOCKSHIPMENTITEM#' + vendorId;
            const skVal = 'STOCKSHIPMENT#' + stockShipmentId + '#STOCKSHIPMENTITEM#' + vendor_sku;


            // Fields to update
            const updatedFields = {
                stock_in: stock_in,
                updated_at: updatedAt,
                modified_by: user?.email || 'API TOKEN'
            };

            // Attempt to update the item
            const result = await updateItemIfExists(pkVal, skVal, updatedFields);

            if (!result.success) {
                // Record failed SKU with reason
                failedItems.push({ item: vendor_sku, error: result.error.message });
            }
        }

        if (failedItems.length > 0) {
            // Some items failed to update
            return {
                success: false,
                message: 'Some items failed to update',
                failedItems: failedItems,
            };
        } else {
            // All items updated successfully
            // Update the stock shipment's updated_at field
            const shipmentUpdateResult = await updateItem(
                'VENDORSTOCKSHIPMENT#' + vendorId,
                'STOCKSHIPMENT#' + stockShipmentId,
                { updated_at: updatedAt }
            );

            if (!shipmentUpdateResult.success) {
                console.error('Failed to update StockShipment item:', shipmentUpdateResult.error);
                return {
                    success: false,
                    error: 'Failed to update stock shipment metadata',
                    details: shipmentUpdateResult.error.message,
                };
            }

            // Return success response
            return {
                success: true,
                shipment_id: stockShipmentId,
                message: 'All items updated in stock shipment successfully',
            };
        }
    } catch (error) {
        console.error('Unhandled error in updateItemsStockInStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function updateStockShipmentItemReceived(vendorId, stockShipmentId, item = {}) {
    const user = getLoggedInUser()
    const allowedFields = ['received', 'faulty', 'vendor_sku']
    // Validate the fields in the input object
    const invalidFields = Object.keys(item).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return { success: false, error: 'Invalid fields', details: `Invalid fields: ${invalidFields.join(', ')}` };
    }
    const vendorSku = item.vendor_sku
    // Construct the update object
    const updateFields = {};
    allowedFields.forEach(field => {
        if (item[field] !== undefined || item[field] !== 'vendor_sku') {
            updateFields[field] = item[field];
        }
    });

    updateFields.updated_at = new Date().toISOString();
    updateFields.modified_by = user?.email || 'API TOKEN'

    // Update the item in the database
    try {
        const result = await updateItemIfExists(`VENDORSTOCKSHIPMENTITEM#${vendorId}`, `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#${vendorSku}`, updateFields);
        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: 'Failed to update stock shipment item', details: result.error };
        }
    } catch (error) {
        console.error('Unhandled error in updateStockShipmentItemReceived:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function getUnshelvedItemsFromStockShipment(vendorId, stockShipmentId) {

    // Check if the shipment exists and belongs to the vendor
    const stockShipmentRes = await getStockShipmentById(vendorId, stockShipmentId);
    if (!stockShipmentRes || !stockShipmentRes.success || !stockShipmentRes.data) {
        return { success: false, error: 'Stock Shipment not found or does not belong to the vendor' };
    }

    if (!stockShipmentRes?.data?.received_at) {
        return { success: false, error: 'Stock Shipment has not been received' }

    }
    //getStockShipmentDetails and filter the ones where recieved is set and greater than 0 but shelved is not set or 0..
    const result = await getStockShipmentDetails(vendorId, stockShipmentId);
    const shipmentData = result.data
    // Filter items where received is set and greater than 0, and shelved is not set or 0
    shipmentData.items = shipmentData.items.filter(item => item.received >= 0 && (!item.shelved || item.shelved === 0));

    return { success: true, data: shipmentData };
}

export async function updateStockShipmentItemAsShelved(vendorId, stockShipmentId, item = {}) {
    // Check if the shipment exists and belongs to the vendor
    const shipmentExists = await checkShipmentExists(vendorId, stockShipmentId);
    if (!shipmentExists) {
        return { success: false, error: 'Shipment not found or does not belong to the vendor' };
    }

    const allowedFields = ['warehouse', 'vendor_sku']
    // Validate the fields in the input object
    const invalidFields = Object.keys(item).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return { success: false, error: `Invalid fields : ${invalidFields.join(', ')}` };
    }
    // Ensure warehouse object has location_id
    if (item.warehouse) {
        item.warehouse.location_id = "2B64NH";
    }

    const vendorSku = item.vendor_sku
    // Construct the update object
    const updateFields = {};
    allowedFields.forEach(field => {
        if (item[field] !== undefined || item[field] !== 'vendor_sku' || item[field] !== 'warehouse') {
            updateFields[field] = item[field];
        }
    });

    updateFields.updated_at = new Date().toISOString();
    updateFields.shelved = 1

    // Format the warehouse object for DynamoDB
    const formattedWarehouse = {
        aisle: { S: item.warehouse.aisle },
        aisle_number: { N: item.warehouse.aisle_number.toString() },
        shelf: { S: item.warehouse.shelf },
        shelf_number: { N: item.warehouse.shelf_number.toString() },
        location_id: { S: item.warehouse.location_id }
    };
    // Construct the update object for the product item
    const productUpdateFields = {
        updated_at: new Date().toISOString(),
        warehouse: formattedWarehouse
    };
    console.log(productUpdateFields)
    // DynamoDB transaction items
    const transactionItems = [
        {
            Update: {
                Key: {
                    PK: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                    SK: `STOCKSHIPMENT#${stockShipmentId}#STOCKSHIPMENTITEM#${vendorSku}`
                },
                UpdateExpression: 'SET shelved = if_not_exists(shelved, :shelved), updated_at = :updated_at',
                // ExpressionAttributeNames: {
                //     '#shelved': 'shelved',
                //     '#updated_at': 'updated_at'
                // },
                ExpressionAttributeValues: {
                    ':shelved': updateFields.shelved,
                    ':updated_at': updateFields.updated_at
                }
            }
        },
        {
            Update: {
                Key: {
                    PK: `VENDORPRODUCT#${vendorId}`,
                    SK: `PRODUCT#${vendorSku}`
                },
                UpdateExpression: 'SET updated_at = :updated_at, warehouse = if_not_exists(warehouse, :warehouse)',
                // ExpressionAttributeNames: {
                //     '#updated_at': 'updated_at',
                //     '#warehouse': 'warehouse'
                // },
                ExpressionAttributeValues: {
                    ':updated_at': productUpdateFields.updated_at,
                    ':warehouse': productUpdateFields.warehouse
                }
            }
        }
    ];
    // console.log('Transaction Items:', JSON.stringify(transactionItems, null, 2));
    try {
        const result = await transactWriteItems(transactionItems);
        return result;
    } catch (error) {
        console.error('Unhandled error in updateStockShipmentItemShelved:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}