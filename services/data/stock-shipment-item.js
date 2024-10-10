import { getProductByVendorSku } from '@/services/data/product';
import { transactWriteItems, updateItem, batchWriteItems } from '@/services/dynamo/wrapper';
import { searchIndex } from '@/services/open-search/wrapper';

export async function addItemsToStockShipment(vendorId, stockShipmentId, stockShipmentItems) {
    try {
        // Step 1: Validate the new items
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

        // Step 2: Fetch existing shipment items to check for duplicates
        const existingItemsResponse = await searchIndex(
            {
                bool: {
                    must: [
                        { term: { 'entity_type.keyword': 'StockShipmentItem' } },
                        { term: { 'shipment_id.keyword': stockShipmentId } },
                        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENTITEM#' + vendorId } },
                    ],
                },
            },
            {},
            0,
            1000 // Adjust size as needed
        );

        const existingItemsHits = existingItemsResponse.hits.hits || [];
        const existingVendorSkus = new Set(
            existingItemsHits.map((hit) => hit._source.vendor_sku)
        );

        // Step 3: Check for duplicates
        const duplicateItems = [];
        const newItems = [];

        for (const item of validItems) {
            if (existingVendorSkus.has(item.vendor_sku)) {
                duplicateItems.push({
                    item: item.vendor_sku,
                    error: `Item with SKU ${item.vendor_sku} already exists in the shipment`,
                });
            } else {
                newItems.push(item);
            }
        }

        if (duplicateItems.length > 0) {
            return {
                success: false,
                error: 'Some items already exist in the shipment',
                invalidItems: duplicateItems,
            };
        }

        // Step 4: Prepare items for batch write
        const itemsToPut = [];
        const createdAt = new Date().toISOString();

        for (const item of newItems) {
            const itemToPut = {
                pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                sk: `STOCKSHIPMENTITEM#${item.vendor_sku}`,
                entity_type: 'StockShipmentItem',
                shipment_id: stockShipmentId,
                vendor_sku: item.vendor_sku,
                stock_in: item.stock_in,
                created_at: createdAt,
                updated_at: createdAt,
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
        // Step 1: Fetch existing shipment items
        const existingItemsResponse = await searchIndex(
            {
                bool: {
                    must: [
                        { term: { 'entity_type.keyword': 'StockShipmentItem' } },
                        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENTITEM#' + vendorId } },
                        { term: { 'shipment_id.keyword': stockShipmentId } },
                        { terms: { 'vendor_sku.keyword': vendorSkusToRemove } },
                    ],
                },
            },
            {},
            0,
            vendorSkusToRemove.length
        );

        const existingItemsHits = existingItemsResponse.hits.hits || [];
        const existingVendorSkus = new Set(
            existingItemsHits.map((hit) => hit._source.vendor_sku)
        );

        // Check if all vendorSkusToRemove exist in the shipment
        const notFoundSkus = vendorSkusToRemove.filter(
            (sku) => !existingVendorSkus.has(sku)
        );

        if (notFoundSkus.length > 0) {
            return {
                success: false,
                error: 'Some items to remove were not found in the shipment',
                invalidItems: notFoundSkus.map((sku) => ({
                    item: sku,
                    error: `Item with SKU ${sku} not found in the shipment`,
                })),
            };
        }

        // Step 2: Prepare items for batch delete
        const itemsToDelete = [];

        for (const sku of vendorSkusToRemove) {
            const deleteItem = {
                pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                sk: `STOCKSHIPMENTITEM#${sku}`,
            };
            itemsToDelete.push(deleteItem);
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
                    item: item.DeleteRequest.Key.sk.replace('STOCKSHIPMENTITEM#', ''),
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
        const vendorSkusToUpdate = shipmentItemsToUpdate.map((item) => item.vendor_sku);

        // Fetch existing shipment items
        const existingItemsResponse = await searchIndex(
            {
                bool: {
                    must: [
                        { term: { 'entity_type.keyword': 'StockShipmentItem' } },
                        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENTITEM#' + vendorId } },
                        { term: { 'shipment_id.keyword': stockShipmentId } },
                        { terms: { 'vendor_sku.keyword': vendorSkusToUpdate } },
                    ],
                },
            },
            {},
            0,
            vendorSkusToUpdate.length
        );

        const existingItemsHits = existingItemsResponse.hits.hits || [];
        const existingVendorSkus = new Set(
            existingItemsHits.map((hit) => hit._source.vendor_sku)
        );

        // Identify items that do not exist
        const nonExistingSkus = vendorSkusToUpdate.filter(
            (vendor_sku) => !existingVendorSkus.has(vendor_sku)
        );

        if (nonExistingSkus.length > 0) {
            return {
                success: false,
                error: 'Some items to update were not found in the shipment',
                invalidItems: nonExistingSkus.map((sku) => ({
                    vendor_sku: sku,
                    error: `Item with SKU ${sku} not found in the shipment`,
                })),
            };
        }

        const updatedAt = new Date().toISOString();

        // Prepare update promises using your updateItem function
        const updatePromises = shipmentItemsToUpdate.map((item) => {
            const { vendor_sku, stock_in } = item;

            // Find the existing item to get pk and sk
            const existingItem = existingItemsHits.find(
                (hit) => hit._source.vendor_sku === vendor_sku
            )._source;

            // Prepare the updated fields
            const updatedFields = {
                updated_at: updatedAt,
                stock_in: stock_in,
            };

            // Call your updateItem function
            return updateItem(
                existingItem.pk,
                existingItem.sk,
                updatedFields
            );
        });

        // Process updates in batches of 25
        const batchSize = 25;
        const errors = [];

        for (let i = 0; i < updatePromises.length; i += batchSize) {
            const batchPromises = updatePromises.slice(i, i + batchSize);

            // Execute batch in parallel
            const batchResults = await Promise.all(batchPromises);

            // Collect errors
            batchResults.forEach((result, index) => {
                if (!result.success) {
                    errors.push({
                        vendor_sku: shipmentItemsToUpdate[i + index].vendor_sku,
                        error: result.error.message,
                    });
                }
            });
        }

        if (errors.length > 0) {
            return {
                success: false,
                error: 'Failed to update some items in stock shipment',
                invalidItems: errors,
            };
        }


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
            message: 'Items updated in stock shipment successfully',
        };
    } catch (error) {
        console.error('Unhandled error in updateItemsStockInStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}