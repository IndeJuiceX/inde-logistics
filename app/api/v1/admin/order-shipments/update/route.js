import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { updateOrderShipment } from '@/services/data/order-shipment';
export const PATCH = withAuthAndLogging(async (request, { params, user }) => {
    try {
        // Extract authentication details
        const { searchParams } = new URL(request.url);


        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }


        const { vendor_id, vendor_order_id, courier } = body;

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !vendor_order_id || !courier) {
            return NextResponse.json({ error: 'vendor_id, vendor_order_id and courier are required' }, { status: 400 });
        }

        // Format and validate the 'courier' object
        let {
            service_code,
            weight,
            depth,
            width,
            height
        } = courier;

        // Trim strings and remove unnecessary whitespace
        service_code = service_code ? service_code.trim() : null;

        // Convert string numbers to actual numbers
        weight = Number(weight);
        depth = Number(depth);
        width = Number(width);
        height = Number(height);


        if (
            !service_code ||
            isNaN(weight) ||
            isNaN(depth) ||
            isNaN(width) ||
            isNaN(height)
        ) {
            return NextResponse.json({ error: 'service_code, weight, height, length and width are required in courier' }, { status: 400 });
        }

        const formattedCourier = {
            service_code,
            weight_grams: weight,
            depth_cm: depth,
            width_cm: width,
            height_cm: height,
        };

        // Update the order's buyer information
        const updateResult = await updateOrderShipment(vendor_id, vendor_order_id, formattedCourier);
        // console.log('updateResult', updateResult);

        if (!updateResult || !updateResult?.success) {
            return NextResponse.json({ error: 'Order Shipment update failed', details: updateResult?.error || 'Order Shipment update failed' }, { status: 400 });
        }
        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse'])
