import { validateOrderItems } from '@/services/schema';
import { checkProductStock, getProductById } from '@/services/data/product'; // Adjust the import path
import { getItem, transactWriteItems, queryItems, updateItem, } from '@/services/external/dynamo/wrapper';
import { generateOrderId, cleanResponseData } from '@/services/utils';
import { executeDataQuery } from '@/services/external/athena';
import { createShipmentAndUpdateOrder } from './order-shipment';
import { getLoggedInUser } from '@/app/actions';
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';

export const createOrder = async (vendorId, order) => {
    try {
        const errors = [];
        const transactionItems = [];

        // Get the current timestamp
        const timestamp = new Date().toISOString();

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

        // Prepare Put operation for the order itself with 'created_at' and 'updated_at'
        const orderPutOperation = {
            Put: {
                Item: {
                    pk: `VENDORORDER#${vendorId}`,
                    sk: `ORDER#${order.vendor_order_id}`,
                    vendor_id: vendorId,
                    vendor_order_id: order.vendor_order_id,
                    expected_delivery_date: order.expected_delivery_date,
                    //shipping_cost: order.shipping_cost,
                    buyer: order.buyer,
                    order_id: uniqueOrderId,
                    entity_type: 'Order',
                    status: 'accepted',
                    created_at: timestamp,
                    updated_at: timestamp,
                    // Include other necessary fields from 'order'
                },
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)', // Ensure order doesn't already exist
            },
        };

        transactionItems.push(orderPutOperation);

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

        // Return success and the created order
        return {
            success: true,
            createdOrder: {
                ...order,
                order_id: uniqueOrderId,
                created_at: timestamp,
                updated_at: timestamp,
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
    const params = {
        KeyConditionExpression: 'pk = :pkVal AND begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
            ':pkVal': pkVal,
            ':skPrefix': skPrefix,
        },

    };
    const orderItemsData = await queryItems(params)
    if (!orderItemsData.success) {
        return { success: false, error: 'Failed to retrieve order items' };
    }

    const orderDetails = {
        ...cleanResponseData(order),
        items: cleanResponseData(orderItemsData.data),
    };
    return { success: true, data: orderDetails };
}

export const getNextUnPickedOrder = async () => {
    const user = await getLoggedInUser();
    if (!user || !user?.email || !user.email.includes('warehouse@indejuice.com')) {
        return { success: false, error: 'Not Authorized' }
    }
    const query1 = `
    SELECT pk,sk
    FROM order_shipments
    WHERE status = 'processing' AND (error IS NULL OR error != 1) AND picker = '${user.email}'
    ORDER BY created_at ASC
    LIMIT 1;
  `;
    const existingData = await executeDataQuery({ query: query1 });
    const existingKeys = existingData?.data[0] || null
    if (existingKeys && existingKeys?.pk && existingKeys?.sk) {
        const vendorId = existingKeys.pk.substring(existingKeys.pk.indexOf('#') + 1);
        const orderId = existingKeys.sk.substring(existingKeys.sk.indexOf('#') + 1);

        const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId)
        const orderData = orderDetailsData?.data || null
        if (!orderData) {
            return {
                success: false,
                error: `Order not found for vendor ${vendorId} and order ${orderId}`,
            }
        }
        orderData.picker = user.email
        return {
            success: true,
            data: orderData,

        }
    }


    const query2 = `
    SELECT vendor_order_id,vendor_id
    FROM orders
    WHERE status = 'accepted'
    ORDER BY created_at ASC
    LIMIT 1;
  `;// get the order with accepted status..
    const data = await executeDataQuery({ query: query2 });
    const nextOrderKeys = data?.data[0] || null
    if (!nextOrderKeys) {
        return { success: true, data: [] }
    }

    const orderDetailsData = await getOrderWithItemDetails(nextOrderKeys.vendor_id, nextOrderKeys.vendor_order_id)
    console.log('orderDetailsData', orderDetailsData)
    if (!orderDetailsData || !orderDetailsData?.success) {
        return { success: false, error: orderDetailsData.error || 'Error in getting Order Details' }
    }
    const updateResponse = await createShipmentAndUpdateOrder(nextOrderKeys.vendor_id, nextOrderKeys.vendor_order_id)

    if (!updateResponse?.success) {
        return { success: false, error: 'Error while creating order or updating order shipment' }
    }

    const orderData = orderDetailsData.data
    orderData.picker = user?.email || 'Unknown'

    return {
        success: true,
        data: orderData,

    }

}

export const getOrderWithItemDetails = async (vendorId, orderId, excludeFields = []) => {
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
                warehouse: product?.warehouse || null,
                barcodes : product?.barcodes || null
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

}