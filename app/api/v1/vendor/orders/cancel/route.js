import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getOrder, cancelOrder } from '@/services/data/order';

export const PATCH = withAuthAndLogging(async (request, { params, user }) => {
    try {
        let vendorId = user?.vendor || null;

        if (!vendorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Parse request body
        const bodyText = await request.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
        }

        let payload;
        try {
            payload = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        // Validate the payload
        const { vendor_order_id } = payload;
        if (!vendor_order_id) {
            return NextResponse.json({ error: 'vendor_order_id is required' }, { status: 400 });
        }

        // Check if the order exists
        const orderItem = await getOrder(vendorId, vendor_order_id);
        if (!orderItem || !orderItem.data) {
            return NextResponse.json(
                {
                    error: `Order with vendor_order_id '${vendor_order_id}' does not exist.`,
                },
                { status: 404 } // HTTP 404 Not Found
            );
        }

        // Check if the order status allows cancellation
        const nonCancellableStatuses = ['Dispatched', 'Delivered', 'Cancelled'];
        if (nonCancellableStatuses.includes(orderItem.data.status)) {
            return NextResponse.json(
                {
                    error: `Order with vendor_order_id '${vendor_order_id}' cannot be cancelled because its status is '${orderItem.data.status}'.`,
                },
                { status: 400 } // Bad Request
            );
        }

        // Proceed to cancel the order
        const cancelResult = await cancelOrder(orderItem.data);

        console.log(cancelResult)
        if (!cancelResult.success) {
            return NextResponse.json(
                { error: 'Failed to cancel order', details: cancelResult.error },
                { status: 500 }
            );
        }

        // Prepare the response payload
        const responsePayload = {
            vendor_order_id: cancelResult.updatedOrder.vendor_order_id,
            cancelled: cancelResult.updatedOrder.status,
        };

        return NextResponse.json(responsePayload, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['vendor', 'admin'])
