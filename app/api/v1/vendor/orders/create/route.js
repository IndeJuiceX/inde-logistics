import { NextResponse } from 'next/server';
import { validateOrder } from '@/services/schema';  // Changed to validateOrder
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { createOrder, orderExists } from '@/services/data/order'; // Changed to createOrder

const MAX_SIZE_BYTES = 2 * 1024 * 1024;  // 2MB in bytes

export const POST = withAuthAndLogging(async (request, { params, user }) => {
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

        if (bodyText.length > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: `Payload exceeds size limit of ${MAX_SIZE_BYTES / (1024 * 1024)}MB` },
                { status: 413 }
            );
        }

        let order;
        try {
            order = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        // Validate the order schema
        const validationResult = validateOrder(order);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid order data',
                    details: validationResult.errors, // This now includes detailed errors
                },
                { status: 400 }
            );
        }


        const validOrder = validationResult.order;

        const orderExistsInDB = await orderExists(vendorId, validOrder.vendor_order_id);

        if (orderExistsInDB) {
            return NextResponse.json(
                {
                    error: `Order with vendor_order_id '${validOrder.vendor_order_id}' already exists.`,
                },
                { status: 409 } // HTTP 409 Conflict
            );
        }

        // Create the order
        const createResult = await createOrder(vendorId, validOrder);

        if (!createResult.success) {
            return NextResponse.json({ error: 'Failed to create order', details: createResult.errors }, { status: 400 });
        }

        // Prepare the response payload
        const responsePayload = {
            created: true,
            vendor_order_id: createResult.createdOrder.vendor_order_id
        };

        return NextResponse.json(responsePayload, { status: 201 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['vendor'])
