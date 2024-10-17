import { validateOrderItems } from '@/services/schema';
import { checkProductStock } from '@/services/data/product'; // Adjust the import path
import { getItem, transactWriteItems, queryItems } from '@/services/dynamo/wrapper';
import { generateOrderId } from '@/services/utils';


export async function createMultipleOrders(vendorId, orders) {
    const createdOrders = [];
    const errorOrders = [];
    const failedOrders = [];

    for (const order of orders) {
        const orderId = generateOrderId(vendorId, order.vendor_order_id);
        let orderStatus = 'accepted'; // Default status
        const orderErrors = [];

        // Assign generated orderId to order
        order.order_id = orderId;

        // Check if the order already exists in the database
        const orderExistsInDB = await orderExists(vendorId, order.vendor_order_id);
        if (orderExistsInDB) {
            // Order already exists, add to failedOrders and continue to the next order
            failedOrders.push({
                order: order,
                errors: [{ message: 'An order with this ID already exists.' }],
            });
            continue;
        }

        // Validate order items
        const itemValidationResult = validateOrderItems(order.items);
        const validatedItems = itemValidationResult.validatedItems;
        const invalidItems = itemValidationResult.invalidItems
        const itemValidationErrors = itemValidationResult.errors;

        // Check if all items are invalid (all have validation issues)
        const allItemsInvalid = validatedItems.length === 0 && invalidItems.length > 0;

        if (allItemsInvalid) {
            // Move to failed orders if no valid items exist
            failedOrders.push({
                order: order,
                errors: [{ message: 'All order items failed validation.', itemErrors: itemValidationErrors }],
            });
            continue; // Skip further processing for this order
        }

        // If there are any validation errors, mark the order as 'error'
        if (itemValidationErrors.length > 0) {
            orderStatus = 'error';
            orderErrors.push({
                message: 'Some order items failed validation.',
                itemErrors: itemValidationErrors,
            });
        }

        // Check stock and SKU existence for validated items
        const skuErrors = [];
        for (const item of validatedItems) {
            const stockCheck = await checkProductStock(vendorId, item.vendor_sku, item.quantity);

            if (!stockCheck.exists) {
                // Product does not exist
                orderStatus = 'error';
                skuErrors.push({
                    vendor_sku: item.vendor_sku,
                    message: `Product with vendor_sku "${item.vendor_sku}" does not exist.`,
                });
            } else if (!stockCheck.success) {
                // Insufficient stock
                orderStatus = 'error';
                skuErrors.push({
                    vendor_sku: item.vendor_sku,
                    message: stockCheck.message,
                });
            }
        }

        if (skuErrors.length > 0) {
            orderErrors.push({
                message: 'Some items have issues with SKU existence or stock availability.',
                skuErrors: skuErrors,
            });
        }

        // Insert the order using the insertOrder function
        const transactionResult = await insertOrder(vendorId, order);

        if (transactionResult.success) {
            if (orderStatus === 'accepted') {
                // Order is clean and accepted
                createdOrders.push({
                    orderId: orderId,
                    vendorOrderId: order.vendor_order_id,
                    status: orderStatus,
                });
            } else if (orderStatus === 'error') {
                // Order is created but has some errors
                errorOrders.push({
                    orderId: orderId,
                    vendorOrderId: order.vendor_order_id,
                    status: orderStatus,
                    errors: orderErrors,
                });
            }
        } else {
            // Transaction failed due to a database error
            console.error(`Error creating order ${order.vendor_order_id}:`, transactionResult.error);
            await insertFailedOrder(vendorId, order, transactionResult.error.message);
            failedOrders.push({
                order: order,
                errors: [
                    {
                        message: 'Error creating order in the database.',
                        error: transactionResult.error.message,
                    },
                ],
            });
        }
    } // End of orders loop

    const success = createdOrders.length > 0;

    return {
        success: success,
        createdOrders: createdOrders,
        errorOrders: errorOrders,
        failedOrders: failedOrders,
    };
}

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
                            sk: `ORDER#${order.vendor_order_id}ITEM#${vendor_sku}`,
                            vendor_id: vendorId,
                            vendor_order_id: order.vendor_order_id,
                            vendor_sku,
                            quantity: requestedQuantity,
                            sales_value: item.sales_value,
                            entity_type: 'OrderItem',
                            status: 'Accepted',
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
                order_id: uniqueId,
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


// In '@/services/data/order.js'



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
                ':skPrefix': `ORDER#${vendor_order_id}ITEM#`,
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




