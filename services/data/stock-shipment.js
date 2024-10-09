import { getProductByVendorSku } from '@/services/data/product';
import { generateShipmentId } from '@/services/utils';
import { transactWriteItems } from '@/services/dynamo/wrapper';

export async function createStockShipment(vendorId, stockShipmentItems) {
    try {
        // Second-tier validation: Check if vendor_sku exists in the database
        const invalidItems = [];
        const validItemsWithProductData = [];

        for (const item of stockShipmentItems) {
            const { vendor_sku } = item;

            // Fetch the existing product by vendor_sku
            const result = await getProductByVendorSku(vendorId, vendor_sku);
            if (!result.success || !result.data || result.data.length === 0) {
                invalidItems.push({
                    item: vendor_sku,
                    error: `Product with SKU ${vendor_sku} not found in the system`,
                });
            } /*else {
                // Add the item along with product data to validItemsWithProductData
                validItemsWithProductData.push({
                    ...item,
                    product: result.data[0],
                });
            }*/
        }

        if (invalidItems.length > 0) {
            return {
                success: false,
                error: 'Some items could not be found, please correct or remove these',
                invalidItems
            };
        }

        // All validations passed, proceed with transaction
        const transactionItems = [];

        const shipmentId = generateShipmentId(vendorId) //uuidv4();
        const createdAt = new Date().toISOString();

        // Prepare the StockShipment entry
        const shipmentItem = {
            Put: {
                Item: {
                    pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
                    sk: `STOCKSHIPMENT#${shipmentId}`,
                    entity_type: 'StockShipment',
                    shipment_id: shipmentId,
                    vendor_id: vendorId,
                    created_at: createdAt,
                    status: 'Submitted',  // Or any initial status you want to set
                    // Add other necessary fields here
                },
            },
        };
        transactionItems.push(shipmentItem);

        // Prepare the StockShipmentItem entries
        for (const item of stockShipmentItems) {
            const itemId = item.vendor_sku//uuidv4();
            //const productId = item.product.sk.split('PRODUCT#')[1];  // Extract product ID from 'sk'

            const shipmentItemEntry = {
                Put: {
                    Item: {
                        pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                        sk: `STOCKSHIPMENTITEM#${itemId}`,
                        entity_type: 'StockShipmentItem',
                        shipment_id: shipmentId,
                        vendor_sku: itemId,
                        //product_id: productId,
                        stock_in: item.stock_in,
                        created_at: createdAt,
                    },
                },
            };
            transactionItems.push(shipmentItemEntry);
        }

        // Execute the transaction
        const transactionResult = await transactWriteItems(transactionItems);

        if (!transactionResult.success) {
            console.error('Transaction failed:', transactionResult.error);
            return {
                success: false,
                error: 'Failed to create stock shipment',
                details: transactionResult.error.message
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