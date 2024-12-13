import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { updateOrderShipmentStatus } from '@/services/data/order-shipment';
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


        const { vendor_id, vendor_order_id } = body;

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !vendor_order_id) {
            return NextResponse.json({ error: 'vendor_id, vendor_order_id are required' }, { status: 400 });
        }


        // Update the order's buyer information
        const updateResult = await updateOrderShipmentStatus(vendor_id, vendor_order_id, 'picked');
        // console.log('updateResult', updateResult);
        
        if (!updateResult || !updateResult?.success) {
            return NextResponse.json({ error: 'Order Shipment status update failed', details: updateResult?.error || 'Order Shipment update failed' }, { status: 400 });
        }
        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse'])
