import { NextResponse } from 'next/server';
import { validateOrderUpdateSchema } from '@/services/schema'; // Updated import
import { decodeToken } from '@/services/Helper';
import { authenticateAndAuthorize } from '@/services/utils';
import { updateOrderBuyer, getOrder } from '@/services/data/order'; // Data access functions

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

    // Validate the payload using the schema
    const validationResult = validateOrderUpdateSchema(payload);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const { vendor_order_id, buyer } = validationResult.value;

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
    // Check if the order status allows updating buyer data
    const nonUpdatableStatuses = ['Dispatched', 'Delivered'];
    if (nonUpdatableStatuses.includes(orderItem.status)) {
      return NextResponse.json(
        {
          error: `Order with vendor_order_id '${vendor_order_id}' cannot be updated because its status is '${orderItem.status}'.`,
        },
        { status: 400 } // Bad Request
      );
    }
    // Update the order's buyer information
    const updateResult = await updateOrderBuyer(vendorId, vendor_order_id, buyer);

    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update order', details: updateResult.error },
        { status: 500 }
      );
    }

    // Prepare the response payload
    const responsePayload = {
      message: 'Order updated successfully',
      order: updateResult.updatedOrder,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
