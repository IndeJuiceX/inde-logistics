import { validateOrderItems } from '@/services/schema';
import { checkProductStock } from '@/services/data/product'; // Adjust the import path
import { getItem } from '@/services/dynamo/wrapper';
import { generateOrderId } from '@/services/utils';

export async function createOrders(vendorId, orders) {
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
            //order.failed_reason = 'An order with this ID already exists.';
            //await insertFailedOrder(vendorId, order, 'Order ID already exists');
            failedOrders.push({
                order: order,
                errors: [{ message: 'An order with this ID already exists.' }],
            });
            continue;
        }

        // Validate order items
        const itemValidationResult = validateOrderItems(order.items);
        const validatedItems = itemValidationResult.validatedItems;
        const itemValidationErrors = itemValidationResult.errors;

        if (itemValidationErrors.length > 0) {
            // Validation errors found
            orderStatus = 'error';
            orderErrors.push({
                message: 'Order items failed validation.',
                itemErrors: itemValidationErrors,
            });
        }

        // Check stock and SKU existence only if there are no validation errors
        if (orderStatus !== 'error') {
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
                    continue;
                }

                if (!stockCheck.success) {
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
        }

        // Insert the order using the insertOrder function
        const transactionResult = await insertOrder(
            vendorId,
            orderId,
            order,
            validatedItems,
            orderStatus,
            orderErrors
        );

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



export async function insertFailedOrder(vendorId, order, failedReason) {
    const pk = `VENDORFAILEDORDER#${vendorId}`;
    const sk = `VENDORORDER#${order.vendor_order_id}`;
    const failedOrderRecord = {
        PK: pk,
        SK: sk,
        orderData: order,
        failedReason: failedReason,
        timestamp: new Date().toISOString(),
    };

    try {
        // Insert into the FailedOrders table in your database
        console.log('INSERTING FAILED ORDER ----')
        console.log(order)
        //await db.insert('FailedOrders', failedOrderRecord); // Adjust to your DB method
    } catch (error) {
        console.error(`Failed to insert failed order ${order.vendor_order_id}:`, error);
        // Optionally handle this error further
    }
}

export async function insertOrder(vendorId, order, orderErrors) {
    // we transact in a way we create an order and orderitem and for each orderitem row we hold the stock from product as well as add
    console.log('INSERTING ORDER---')
    console.log(order)
}

