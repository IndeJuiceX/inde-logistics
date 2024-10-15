import { NextResponse } from 'next/server';
import { validateOrders } from '@/services/schema';
import { decodeToken } from '@/services/Helper';
import { authenticateAndAuthorize } from '@/services/utils';
import { createOrders } from '@/services/data/order'; // Assuming createOrders is imported correctly.

const MAX_SIZE_BYTES = 2 * 1024 * 1024;  // 2MB in bytes

export async function POST(request) {
    try {
        // Extract authentication details
        const { authorized, user } = await authenticateAndAuthorize(request);
        let vendorId = user?.vendor || null;
        if (!authorized || vendorId == null) {
            const apiToken = request.headers.get('Authorization')?.split(' ')[1];  // Bearer token
            if (!apiToken) {
                return NextResponse.json({ error: 'Missing API token' }, { status: 401 });
            }
            const decoded = decodeToken(apiToken);
            if (!decoded) {
                return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
            }
            vendorId = decoded.vendorId;
        }

        // Parse request body
        const bodyText = await request.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
        }

        if (bodyText.length > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: `Payload exceeds size limit of ${MAX_SIZE_BYTES / (1024 * 1024)}MB` },
                { status: 413 }
            );
        }

        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        // Ensure 'orders' field exists and is an array
        if (!body.orders || !Array.isArray(body.orders)) {
            return NextResponse.json({ error: 'Invalid request format: "orders" field is required and must be an array' }, { status: 400 });
        }

        // Validate the orders schema
        const validationResult = validateOrders(body.orders);

        const validOrders = validationResult.validatedItems || [];
        const invalidOrders = validationResult.errors || [];

        console.log('INVALID ORDERS---')
        console.log(invalidOrders)
        // Initialize result containers
        let ordersCreateResult = {
            success: true,
            createdOrders: [],
            errorOrders: [],
            failedOrders: [],
        };

        // Process valid orders
        if (validOrders.length > 0) {
            // Proceed to create orders with valid items
            ordersCreateResult = await createOrders(vendorId, validOrders);
            // Assuming createOrders returns { success, createdOrders, errorOrders, failedOrders }
        }

        // Prepare the response payload
        const responsePayload = {
            message: 'Order processing completed',
            createdOrders: ordersCreateResult.createdOrders || [],
            errorOrders: ordersCreateResult.errorOrders || [],
            failedOrders: [],
        };

        // Combine invalid orders and failed orders
        const combinedFailedOrders = [...invalidOrders, ...(ordersCreateResult.failedOrders || [])];

        if (combinedFailedOrders.length > 0) {
            // Map the failed orders to a consistent format if necessary
            responsePayload.failedOrders = combinedFailedOrders.map((order) => {
                return {
                    orderId: order.order?.order_id || null,
                    vendorOrderId: order.order?.vendor_order_id || null,
                    errors: order.errors || [{ message: 'Unknown error' }],
                };
            });
        }

        // Determine the appropriate status code
        const hasSuccess = responsePayload.createdOrders.length > 0 || responsePayload.errorOrders.length > 0;
        const statusCode = hasSuccess ? 201 : 400;

        return NextResponse.json(responsePayload, { status: statusCode });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}


