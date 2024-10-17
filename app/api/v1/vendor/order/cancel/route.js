import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/services/utils';
import { decodeToken } from '@/services/Helper';
import { getOrder, cancelOrder } from '@/services/data/order';

export async function PATCH(request) {
  try {
    // Extract authentication details
    const { authorized, user } = await authenticateAndAuthorize(request);
    let vendorId = user?.vendor || null;

    if (!authorized || vendorId == null) {
      const apiToken = request.headers.get('Authorization')?.split(' ')[1]; // Bearer token
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
    if (!orderItem) {
      return NextResponse.json(
        {
          error: `Order with vendor_order_id '${vendor_order_id}' does not exist.`,
        },
        { status: 404 } // HTTP 404 Not Found
      );
    }

    // Check if the order status allows cancellation
    const nonCancellableStatuses = ['Dispatched', 'Delivered', 'Cancelled'];
    if (nonCancellableStatuses.includes(orderItem.status)) {
      return NextResponse.json(
        {
          error: `Order with vendor_order_id '${vendor_order_id}' cannot be cancelled because its status is '${orderItem.status}'.`,
        },
        { status: 400 } // Bad Request
      );
    }

    // Proceed to cancel the order
    const cancelResult = await cancelOrder(orderItem);

    if (!cancelResult.success) {
      return NextResponse.json(
        { error: 'Failed to cancel order', details: cancelResult.error },
        { status: 500 }
      );
    }

    // Prepare the response payload
    const responsePayload = {
      message: 'Order cancelled successfully',
      order: cancelResult.updatedOrder,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
