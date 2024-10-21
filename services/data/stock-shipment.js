import { getProductByVendorSku } from '@/services/data/product';
import { generateShipmentId } from '@/services/utils';
import { transactWriteItems,putItem,batchWriteItems,queryItems } from '@/services/dynamo/wrapper';
import { cleanResponseData } from '@/services/utils';
export async function createStockShipment(vendorId, stockShipmentItems) {
    try {
        // Second-tier validation: Check if vendor_sku exists in the database
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
                sk: `STOCKSHIPMENTITEM#${itemId}`,
                entity_type: 'StockShipmentItem',
                shipment_id: shipmentId,
                vendor_sku: itemId,
                stock_in: item.stock_in,
                created_at: createdAt,
                updated_at: createdAt,
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

export async function getStockShipmentById(vendorId, stockShipmentId) {
    const must = [
        { term: { 'entity_type.keyword': 'StockShipment' } },           // Match the exact entity_type
        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENT#' + vendorId } },
        { term: { 'sk.keyword': 'STOCKSHIPMENT#' + stockShipmentId } }
    ];
    const response = await searchIndex({
        bool: {
            must: must
        }
    }, {}, 0, 1);

    const results = response.hits.hits;
    const totalHits = response.hits.total.value;  // Total number of matched records

    // Extract only the _source field
    const sources = results.map(item => item._source);
    return {
        success: true,
        data: sources,
        pagination: {
            page: 1,
            pageSize: 1,
            total: totalHits  // Use total hits for pagination, not results length
        }
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

            return {
                success: true,
                data: cleanResponseData(result.data),
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



export async function getStockShipmentDetails(vendorId, stockShipmentId) {
    // const from = (page - 1) * pageSize;
    // const size = pageSize;

    // Get the stock shipment data
    const stockShipmentData = await getStockShipmentById(vendorId, stockShipmentId);

    // Extract the shipment object
    const stockShipmentArray = stockShipmentData.data;
    if (!stockShipmentArray || stockShipmentArray.length === 0) {
        // Handle case where shipment is not found
        return {
            success: false,
            error: 'Stock shipment not found.',
        };
    }
    const stockShipment = stockShipmentArray[0]; // Get the shipment object


    // Build the query for shipment items
    const shipmentItemsMust = [
        { term: { 'entity_type.keyword': 'StockShipmentItem' } },
        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENTITEM#' + vendorId } },
        { term: { 'shipment_id.keyword': stockShipmentId } },
    ];

    // Fetch shipment items with pagination
    const shipmentItemsResponse = await searchIndex(
        {
            bool: {
                must: shipmentItemsMust,
            },
        },
        {},
        0,
        10000
    );

    console.log('SHIPMENT ITEMS RESPOSNE----')
    console.log(shipmentItemsResponse)
    const shipmentItemsHits = shipmentItemsResponse.hits.hits;

    // Get total number of shipment items for pagination
    const totalHits = shipmentItemsResponse.hits.total.value;

    // If no shipment items found
    if (shipmentItemsHits.length === 0) {
        return {
            success: true,
            data: [],
        };
    }

    // Step 2: Extract Vendor SKUs from current page of items
    const vendorSkus = shipmentItemsHits.map((hit) => hit._source.vendor_sku);
    const uniqueVendorSkus = [...new Set(vendorSkus)];

    // Step 3: Fetch Product Data
    const productsMust = [
        { term: { 'entity_type.keyword': 'Product' } },
        { term: { 'pk.keyword': 'VENDORPRODUCT#' + vendorId } },
        { terms: { 'vendor_sku.keyword': uniqueVendorSkus } },
    ];

    const productsResponse = await searchIndex(
        {
            bool: {
                must: productsMust,
            },
        },
        {},
        0,
        uniqueVendorSkus.length
    );

    // Create a map of vendor_sku to product data
    const productDataMap = {};
    productsResponse.hits.hits.forEach((hit) => {
        const product = hit._source;
        productDataMap[product.vendor_sku] = {
            name: product.name,
            image: product.image,
            brand_name: product.brand_name,
        };
    });

    // Step 4: Merge Shipment Items with Product Data
    const shipmentItems = shipmentItemsHits.map((hit) => {
        const item = hit._source;
        const productInfo = productDataMap[item.vendor_sku] || {};

        return {
            vendor_sku: item.vendor_sku,
            quantity: item.stock_in,
            ...productInfo,
        };
    });

    // Return the final data in the desired format
    return {
        success: true,
        data: { stock_shipment: stockShipment, stock_shipment_items: shipmentItems }, // Shipment items as data
    };
}

export async function checkShipmentExists(vendorId, stock_shipment_id) {
    const shipmentData = await getStockShipmentById(vendorId, stock_shipment_id);
    return shipmentData.success && shipmentData.data.length > 0;
}