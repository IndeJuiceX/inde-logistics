import { validateOrderItems } from '@/services/schema';
import { checkProductStock, getProductById } from '@/services/data/product'; // Adjust the import path
import { getItem, transactWriteItems, queryItems, updateItem, } from '@/services/external/dynamo/wrapper';
import { generateOrderId, cleanResponseData } from '@/services/utils';
import { executeDataQuery } from '@/services/external/athena';
import { createShipmentAndUpdateOrder } from './order-shipment';
import { getLoggedInUser } from '@/app/actions';
import { queryItemsWithPkAndSk, batchGetItems } from '@/services/external/dynamo/wrapper';
import { getCourierDetails, validateOrderShippingCode } from '@/services/data/courier';
import { getExpectedDeliveryDate } from '@/services/utils';
export const createOrder = async (vendorId, order) => {
    try {
        const errors = [];
        const transactionItems = [];
        const validShippingCode = await validateOrderShippingCode(vendorId, order)

        if (!validShippingCode.success) {
            return { success: false, error: validShippingCode?.error || 'Could not validate order shipping code', details: validShippingCode?.details || 'Order Shipping code validation failed' }
        }
        const courierData = await getCourierDetails(vendorId, order.shipping_code)

        const indeShippingID = courierData.data[0].inde_shipping_id
        // Get the current timestamp
        const timestamp = new Date().toISOString();
        // Determine whether to include customs_code
        const needCustomsCode =
            order.buyer.country_code !== 'GB' || order.shipping_code.includes('-INT');
        // For each item in the order
        for (const item of order.items) {
            const vendor_sku = item.vendor_sku;
            const requestedQuantity = item.quantity;

            // Check product stock
            const stockCheckResult = await checkProductStock(vendorId, vendor_sku, requestedQuantity);

            if (!stockCheckResult.success) {
                // Collect item-level errors
                errors.push({
                    vendor_sku,
                    message: stockCheckResult.message,
                });
            } else {
                // Prepare Update operation to decrease stock atomically and update 'updated_at'
                const updateOperation = {
                    Update: {
                        Key: {
                            pk: `VENDORPRODUCT#${vendorId}`,
                            sk: `PRODUCT#${vendor_sku}`,
                        },
                        UpdateExpression: 'ADD stock_available :decrement SET updated_at = :updatedAt',
                        ConditionExpression: 'stock_available >= :requestedQuantity',
                        ExpressionAttributeValues: {
                            ':decrement': -requestedQuantity,
                            ':requestedQuantity': requestedQuantity,
                            ':updatedAt': timestamp,
                        },
                    },
                };

                transactionItems.push(updateOperation);

                // Prepare Put operation for order item with 'created_at' and 'updated_at'
                const orderItemPutOperation = {
                    Put: {
                        Item: {
                            pk: `VENDORORDERITEM#${vendorId}`,
                            sk: `ORDER#${order.vendor_order_id}#ITEM#${vendor_sku}`,
                            vendor_id: vendorId,
                            vendor_order_id: order.vendor_order_id,
                            vendor_sku,
                            quantity: requestedQuantity,
                            sales_value: item.sales_value,
                            entity_type: 'OrderItem',
                            created_at: timestamp,
                            updated_at: timestamp,
                            // Include other necessary fields from 'item'
                        },
                    },
                };
                // Include customs_code if required and present
                if (needCustomsCode && item.customs_code) {
                    orderItemPutOperation.Put.Item.customs_code = item.customs_code;
                }

                transactionItems.push(orderItemPutOperation);
            }
        }

        // If any stock checks failed, return the errors
        if (errors.length > 0) {
            return {
                success: false,
                errors,
            };
        }

        // Generate a unique ID for the order if not already provided
        const uniqueOrderId = generateOrderId(vendorId, order.vendor_order_id); // You need to implement generateUniqueId()

        // Return success and the created order
        const expectedDeliveryData = await getExpectedDeliveryDate(indeShippingID)
        const expectedDelivery = expectedDeliveryData?.data || null
        let expectedDeliveryFromDate = null
        let expectedDeliveryToDate = null

        if (expectedDelivery) {
            const [day, month, year] = expectedDelivery.expected_delivery_to_date.split('-');
            expectedDeliveryToDate = new Date(`${year}-${month}-${day}`).toISOString();
            const [dayF, monthF, yearF] = expectedDelivery.expected_delivery_from_date.split('-');
            expectedDeliveryFromDate = new Date(`${yearF}-${monthF}-${dayF}`).toISOString();
        }
        // Prepare Put operation for the order itself with 'created_at' and 'updated_at'
        const orderPutOperation = {
            Put: {
                Item: {
                    pk: `VENDORORDER#${vendorId}`,
                    sk: `ORDER#${order.vendor_order_id}`,
                    vendor_id: vendorId,
                    vendor_order_id: order.vendor_order_id,
                    //shipping_code: order.shipping_code,
                    //expected_delivery_date: expectedDelivery?.expected_delivery_to_date || null, //order.expected_delivery_date,
                    shipping_cost: order.shipping_cost,
                    buyer: order.buyer,
                    order_id: uniqueOrderId,
                    entity_type: 'Order',
                    status: 'accepted',
                    add_ons: order.add_ons,
                    created_at: timestamp,
                    updated_at: timestamp,
                    // Include other necessary fields from 'order'
                },
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)', // Ensure order doesn't already exist
            },
        };
        transactionItems.push(orderPutOperation);
        // Process applied_add_ons
        if (order.applied_add_ons) {
            for (const [addOnKey, addOnDetails] of Object.entries(order.applied_add_ons)) {
                const { name, price, cost, key } = addOnDetails;

                transactionItems.push({
                    Put: {
                        Item: {
                            pk: `VENDORADDONCHARGE#${vendorId}`,
                            sk: `BILLING#${timestamp}#${key}#${order.vendor_order_id}`,
                            vendor_id: vendorId,
                            vendor_order_id: order.vendor_order_id,
                            order_id: uniqueOrderId,
                            add_on_id: key,
                            add_on_name: name,
                            price,
                            cost,
                            applied_at: timestamp,
                            billing_period: timestamp.substring(0, 7), // e.g., "2024-12"
                            created_at: timestamp,
                        },
                    },
                });
            }
        }

        // OrderShipment entry
        const orderShipmentPutOperation = {
            Put: {
                Item: {
                    pk: `VENDORORDERSHIPMENT#${vendorId}`,
                    sk: `ORDERSHIPMENT#${order.vendor_order_id}`,
                    ready_for : `picking#VENDOR#${vendorId}#ORDERSHIPMENT#${order.vendor_order_id}#${timestamp}`,
                    shipping_code: order.shipping_code,
                    expected_delivery_from_date: expectedDeliveryFromDate,
                    expected_delivery_to_date:expectedDeliveryToDate, //order.expected_delivery_date,
                    shipping_cost: order.shipping_cost,
                    entity_type: 'OrderShipment',
                    status: 'accepted',
                    created_at: timestamp,
                    updated_at: timestamp,
                    // Include other necessary fields from 'order'
                },
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)', // Ensure order doesn't already exist
            },
        }
        transactionItems.push(orderShipmentPutOperation);

        // Execute the transaction
        const transactionResult = await transactWriteItems(transactionItems);

        if (!transactionResult.success) {
            // Handle transaction failure
            const error = transactionResult.error;

            if (error.name === 'ConditionalCheckFailedException') {
                return {
                    success: false,
                    error: 'Transaction failed due to a conditional check failure.',
                    details: error.message,
                };
            } else {
                return {
                    success: false,
                    error: 'Transaction failed.',
                    details: error.message,
                };
            }
        }

        // // Return success and the created order
        // const expectedDeliveryData = await getExpectedDeliveryDate(validShippingCode.data.shipping_id)
        // const expectedDelivery = expectedDeliveryData?.data  || null
        return {
            success: true,
            createdOrder: {
                order_id: uniqueOrderId,
                vendor_order_id: order.vendor_order_id,
                expected_delivery_date: expectedDeliveryDate
            },
        };
    } catch (error) {
        console.error('Error in createOrder:', error);
        return {
            success: false,
            error: 'Server error.',
            details: error.message,
        };
    }
};


export async function getOrder(vendorId, orderId) {
    return await getItem(`VENDORORDER#${vendorId}`, `ORDER#${orderId}`);
}

export async function orderExists(vendorId, vendorOrderId) {
    try {
        const result = await getOrder(vendorId, vendorOrderId);
        return result.success;
    } catch (error) {
        console.error('Error checking order existence:', error);
        return false;
    }
}

export const updateOrderBuyer = async (vendorId, vendor_order_id, buyer) => {
    const timestamp = new Date().toISOString();

    // Construct the partition key and sort key values
    const pkVal = `VENDORORDER#${vendorId}`;
    const skVal = `ORDER#${vendor_order_id}`;

    // Fields to update
    const updatedFields = {
        buyer: buyer,
        updated_at: timestamp
    };


    // Call the updateItem function
    const result = await updateItem(pkVal, skVal, updatedFields);

    // console.log(result)
    if (result.success) {
        return {
            success: true,
            updatedOrder: result.data
        };
    } else {
        console.error('Error updating order buyer:', result.error);
        return {
            success: false,
            error: result.error.message || 'Unknown error'
        };
    }
};


export const cancelOrder = async (order) => {
    const timestamp = new Date().toISOString();

    try {
        const vendorId = order.vendor_id;
        const vendor_order_id = order.vendor_order_id;

        // Retrieve the order items using queryItems wrapper
        const queryParams = {
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
            ExpressionAttributeValues: {
                ':pk': `VENDORORDERITEM#${vendorId}`,
                ':skPrefix': `ORDER#${vendor_order_id}#ITEM#`,
            },
        };

        const queryResult = await queryItems(queryParams);

        if (!queryResult.success) {
            console.error('Error querying order items:', queryResult.error);
            return {
                success: false,
                error: 'Failed to retrieve order items.',
            };
        }

        const orderItems = queryResult.data;

        if (!orderItems || orderItems.length === 0) {
            return {
                success: false,
                error: `No items found for order with vendor_order_id '${vendor_order_id}'.`,
            };
        }

        // Prepare the transaction items
        const transactItems = [];

        // Update the order status to 'Cancelled' and 'updated_at'
        const updateOrderItem = {
            Update: {
                Key: {
                    pk: `VENDORORDER#${vendorId}`,
                    sk: `ORDER#${vendor_order_id}`,
                },
                UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: {
                    ':status': 'cancelled',
                    ':updated_at': timestamp,
                    ':cancelled': 'cancelled', // Define the :cancelled attribute value

                },
                ConditionExpression: 'attribute_exists(pk) AND #status <> :cancelled',
            },
        };

        transactItems.push(updateOrderItem);

        // For each order item, update the product's stock_available
        for (const item of orderItems) {
            const vendor_sku = item.vendor_sku;
            const quantity = item.quantity;

            const productKey = {
                pk: `VENDORPRODUCT#${vendorId}`,
                sk: `PRODUCT#${vendor_sku}`,
            };

            const updateProductItem = {
                Update: {
                    Key: productKey,
                    UpdateExpression:
                        'SET stock_available = stock_available + :increment, updated_at = :updated_at',
                    ExpressionAttributeValues: {
                        ':increment': quantity,
                        ':updated_at': timestamp,
                    },
                    ConditionExpression: 'attribute_exists(pk)',
                },
            };

            transactItems.push(updateProductItem);
        }

        // Execute the transaction using transactWriteItems
        const transactionResult = await transactWriteItems(transactItems);

        if (!transactionResult.success) {
            console.error('Transaction failed:', transactionResult.error);
            return {
                success: false,
                error: 'Failed to cancel order due to a transaction error.',
            };
        }

        // Return success with updated order information
        return {
            success: true,
            updatedOrder: {
                ...order,
                status: 'cancelled',
                updated_at: timestamp,
            },
        };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};



export const getAllOrders = async (vendorId, pageSize = 25, exclusiveStartKey = null) => {
    const pkVal = `VENDORORDER#${vendorId}`;
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
        console.error('Error retrieving all orders:', error);
        return { success: false, error: 'Failed to retrieve orders' };
    }
};

export const getOrderDetails = async (vendorId, vendorOrderId) => {
    const orderData = await getOrder(vendorId, vendorOrderId);
    // console.log(orderData)
    if (!orderData.success) {
        return { success: false, error: orderData?.error || 'Order not found ' };
    }
    const order = orderData.data

    const pkVal = `VENDORORDERITEM#${vendorId}`
    const skPrefix = `ORDER#${vendorOrderId}#ITEM#`;
    // const params = {
    //     KeyConditionExpression: 'pk = :pkVal AND begins_with(sk, :skPrefix)',
    //     ExpressionAttributeValues: {
    //         ':pkVal': pkVal,
    //         ':skPrefix': skPrefix,
    //     },

    // };
    const orderItemsData = await queryItemsWithPkAndSk(pkVal, skPrefix)
    if (!orderItemsData.success) {
        return { success: false, error: 'Failed to retrieve order items' };
    }

    const orderDetails = {
        ...cleanResponseData(order),
        items: cleanResponseData(orderItemsData.data),
    };
    return { success: true, data: orderDetails };
}



/*export const getOrderWithItemDetails = async (vendorId, orderId, excludeFields = []) => {
    const orderData = await getOrder(vendorId, orderId);
    if (!orderData.success) {
        return { success: false, error: orderData?.error || 'Order not found ' };
    }
    const order = orderData.data

    const orderItemsData = await queryItemsWithPkAndSk(`VENDORORDERITEM#${vendorId}`, `ORDER#${orderId}#ITEM#`)
    if (!orderItemsData.success) {
        return { success: false, error: orderItemsData?.error || 'Order Items not found ' };
    }

    const orderItems = orderItemsData.data

    const cleanOrderItem = []

    const cleanOrderItems = await Promise.all(orderItems.map(async (orderItem) => {
        const productData = await getProductById(vendorId, orderItem.vendor_sku);
        const product = productData?.data;
        if (product) {
            return {
                vendor_sku: orderItem.vendor_sku,
                quantity: orderItem.quantity,
                name: product.name, // Example of adding product data
                brand_name: product.brand_name,
                attributes: product.attributes,
                image: product.image,
                sale_price : product.sale_price,
                cost_price : product.cost_price,
                warehouse: product?.warehouse || null,
                barcodes: product?.barcodes || null,
                customs_code : product?.customs_code || null
            };
        }
        return null;

    }));
    const filteredCleanOrderItems = cleanOrderItems.filter(item => item !== null);

    const cleanOrder = cleanResponseData(order)
    cleanOrder.items = filteredCleanOrderItems
    return {
        success: true,
        data: cleanOrder
    };

}*/
export const getOrderWithItemDetails = async (vendorId, orderId, excludeFields = []) => {
    // Fetch the order data
    const orderData = await getOrder(vendorId, orderId);
    if (!orderData.success) {
        return { success: false, error: orderData?.error || 'Order not found' };
    }
    const order = orderData.data;

    // Fetch the order items data
    const orderItemsData = await queryItemsWithPkAndSk(`VENDORORDERITEM#${vendorId}`, `ORDER#${orderId}#ITEM#`);
    if (!orderItemsData.success) {
        return { success: false, error: orderItemsData?.error || 'Order Items not found' };
    }

    const orderItems = orderItemsData.data;

    // Extract unique vendor_sku values from orderItems
    const vendorSkus = orderItems.map((item) => item.vendor_sku);
    const uniqueVendorSkus = [...new Set(vendorSkus)];

    // Build keyPairs for batch fetching
    const keyPairs = uniqueVendorSkus.map((sku) => ({
        pk: `VENDORPRODUCT#${vendorId}`,
        sk: `PRODUCT#${sku}`,
    }));

    // Attributes to fetch from products
    const attributesToFetch = [
        'vendor_sku',
        'name',
        'brand_name',
        'attributes',
        'image',
        'sale_price',
        'cost_price',
        'warehouse',
        'barcodes',
        'customs_code',
    ];

    // Fetch products in batch
    const batchResult = await batchGetItems(keyPairs, { attributes: attributesToFetch });

    if (!batchResult.success) {
        return { success: false, error: 'Failed to fetch product data' };
    }

    const products = batchResult.data;

    // Build a map of products for quick lookup
    const productDataMap = {};
    for (const product of products) {
        productDataMap[product.vendor_sku] = product;
    }

    // Map order items with their corresponding product details
    const cleanOrderItems = orderItems.map((orderItem) => {
        const product = productDataMap[orderItem.vendor_sku];
        if (product) {
            return {
                vendor_sku: orderItem.vendor_sku,
                quantity: orderItem.quantity,
                name: product.name,
                brand_name: product.brand_name,
                attributes: product.attributes,
                image: product.image,
                sale_price: product.sale_price,
                cost_price: product.cost_price,
                warehouse: product.warehouse || null,
                barcodes: product.barcodes || null,
                customs_code: product.customs_code || null,
            };
        } else {
            // Handle case where product data is missing
            return {
                vendor_sku: orderItem.vendor_sku,
                quantity: orderItem.quantity,
                // Other fields could be set to null or default values
            };
        }
    });

    // Clean the order data
    const cleanOrder = cleanResponseData(order);
    cleanOrder.items = cleanOrderItems;

    return {
        success: true,
        data: cleanOrder,
    };
};

export const getMultipleOrdersByIds = async (vendorId, vendorOrderIds) => {
    try {
        const vendorOrderKey = `VENDORORDER#${vendorId}`;
        const vendorOrderShipmentKey = `VENDORORDERSHIPMENT#${vendorId}`;
        const vendorOrderItemKey = `VENDORORDERITEM#${vendorId}`;
        const vendorProductKey = `VENDORPRODUCT#${vendorId}`;

        // Step 1: Fetch Orders
        const orderKeyPairs = vendorOrderIds.map((orderId) => ({
            pk: vendorOrderKey,
            sk: `ORDER#${orderId}`,
        }));

        const ordersResult = await batchGetItems(orderKeyPairs, {
            attributes: ['vendor_order_id', 'created_at', 'updated_at', 'buyer', 'shipping_cost', 'shipping_code', 'status', 'expected_delivery_date'],
        });

        if (!ordersResult.success) {
            return { success: false, error: ordersResult.error };
        }

        const ordersData = ordersResult.data;

        // Step 2: Fetch Order Shipments
        const orderShipmentKeyPairs = vendorOrderIds.map((orderId) => ({
            pk: vendorOrderShipmentKey,
            sk: `ORDERSHIPMENT#${orderId}`,
        }));

        const shipmentsResult = await batchGetItems(orderShipmentKeyPairs, {
            attributes: ['sk', 'status', 'tracking'],
        });

        const shipmentsData = shipmentsResult.success ? shipmentsResult.data : [];

        // Map shipments by orderId for easy lookup
        const shipmentsMap = {};
        shipmentsData.forEach((shipment) => {
            const orderId = shipment.sk.replace('ORDERSHIPMENT#', '');
            shipmentsMap[orderId] = shipment;
        });

        // Step 3: Fetch Order Items
        const orderItemsResult = await fetchOrderItems(vendorId, vendorOrderIds);

        if (!orderItemsResult.success) {
            return { success: false, error: orderItemsResult.error };
        }

        const orderItemsData = orderItemsResult.data;

        // Step 4: Fetch Vendor Products
        const vendorSkusSet = new Set();
        orderItemsData.forEach((item) => {
            if (item.vendor_sku) {
                vendorSkusSet.add(item.vendor_sku);
            }
        });
        const vendorSkus = Array.from(vendorSkusSet);

        const productKeyPairs = vendorSkus.map((sku) => ({
            pk: vendorProductKey,
            sk: `PRODUCT#${sku}`,
        }));

        const productsResult = await batchGetItems(productKeyPairs, {
            attributes: ['vendor_sku', 'name', 'brand_name'],
        });

        const productsData = productsResult.success ? productsResult.data : [];

        const productsMap = {};
        productsData.forEach((product) => {
            productsMap[product.vendor_sku] = product;
        });

        // Step 5: Assemble Final Response
        const finalOrders = ordersData.map((order) => {
            const orderId = order.vendor_order_id;

            // Get shipment info
            const shipment = shipmentsMap[orderId];
            if (shipment && shipment.status === 'dispatched' && shipment.tracking) {
                order.shipment_tracking = shipment.tracking;
            }

            // Get order items for this order
            const items = orderItemsData.filter(
                (item) => item.order_id === orderId
            );

            // Enrich items with product data
            const enrichedItems = items.map((item) => {
                const product = productsMap[item.vendor_sku] || {};
                return {
                    ...cleanResponseData(item, ['order_id', 'vendor_order_id']),
                    ...product,
                };
            });

            return {
                ...order,
                items: enrichedItems,
            };
        });

        return { success: true, data: finalOrders };
    } catch (error) {
        console.error('Error fetching orders by IDs:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
};

// Helper function to fetch order items
const fetchOrderItems = async (vendorId, vendorOrderIds) => {
    try {
        const vendorOrderItemKey = `VENDORORDERITEM#${vendorId}`;
        const allItems = [];
        // Use Promise.all to fetch order items in parallel
        const promises = vendorOrderIds.map(async (orderId) => {
            const result = await queryItemsWithPkAndSk(vendorOrderItemKey, `ORDER#${orderId}#ITEM#`, ['quantity', 'sales_value', 'vendor_sku', 'vendor_order_id'])
            if (!result.success) {
                throw new Error(`Failed to fetch items for order ${orderId}`);
            }
            // Add order_id to each item
            const itemsWithOrderId = result.data.map((item) => ({
                ...item,
                order_id: orderId,
            }));
            allItems.push(...itemsWithOrderId);
        });

        await Promise.all(promises);

        return { success: true, data: allItems };
    } catch (error) {
        console.error('Error fetching order items:', error);
        return { success: false, error: 'Failed to fetch order items' };
    }
};