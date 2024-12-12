import { NextResponse } from "next/server";
import { validateOrder } from "@/services/schema";
import { createOrder } from "@/services/data/order";
export const POST = async (request) => {

    try {
        console.time('queryItemsWithPkAndSk'); // End timer and log duration

        let vendorId = 'b71812ec'
        // Parse request body
        const bodyText = await request.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
        }

        // if (bodyText.length > MAX_SIZE_BYTES) {
        //     return NextResponse.json(
        //         { error: `Payload exceeds size limit of ${MAX_SIZE_BYTES / (1024 * 1024)}MB` },
        //         { status: 413 }
        //     );
        // }

        let order;
        try {
            order = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        // Validate the order schema
        const validationResult = await validateOrder(order, vendorId);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid order data',
                    vendor_order_id: order?.vendor_order_id || 'UNKNOWN',
                    details: validationResult.errors, // This now includes detailed errors
                },
                { status: 400 }
            );
        }


        const validOrder = validationResult.order;
        // Create the order
        const createResult = await createOrder(vendorId, validOrder);

        if (!createResult.success) {
            return NextResponse.json({
                // error: 'Failed to create order', vendor_order_id: order?.vendor_order_id || 'UNKNOWN',
                error: createResult?.error || 'Failed to create order', vendor_order_id: order?.vendor_order_id || 'UNKNOWN',
                details: createResult.errors
            }, { status: 400 });
        }

        // Prepare the response payload
        const responsePayload = {
            created: true,
            vendor_order_id: createResult.createdOrder.vendor_order_id,
            order_ref: createResult.createdOrder.order_id,
            expected_delivery_date: createResult.createdOrder.expected_delivery_date
        };

        return NextResponse.json(responsePayload, { status: 201 });
    } catch (error) {
        console.log(error)
        console.timeEnd('queryItemsWithPkAndSk'); // End timer and log duration

        return NextResponse.json({ error: 'Unexpected server error', details: error }, { status: 500 });
    }
};