import { validateOrderItems } from '@/services/schema';
import { checkProductStock } from '@/services/data/product'; // Adjust the import path
import { getItem, transactWriteItems, queryItems, updateItem } from '@/services/dynamo/wrapper';
import { generateOrderId, cleanResponseData } from '@/services/utils';


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
                    shipping_cost: order.shipping_cost,
                    buyer: order.buyer,
                    order_id: uniqueOrderId,
                    entity_type: 'Order',
                    status: 'Accepted',
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

    console.log(result)
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
                    ':status': 'Cancelled',
                    ':updated_at': timestamp,
                    ':cancelled': 'Cancelled', // Define the :cancelled attribute value

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
                status: 'Cancelled',
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
    console.log(orderData)
    if(!orderData.success) {
        return { success: false, error: orderData?.error||'Order not found ' };
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

