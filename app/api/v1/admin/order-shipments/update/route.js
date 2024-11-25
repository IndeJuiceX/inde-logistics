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

        // validate that courier has all the information
        const{service_code,weight, length, width, height} = courier

        if (!service_code || !weight || !length || !width || !height) {
            return NextResponse.json({ error: 'service_code, weight, height, length and width are required in courier' }, { status: 400 });
        }

        // Update the order's buyer information
        const updateResult = await updateOrderShipment(vendor_id, vendor_order_id, courier);
        console.log('updateResult', updateResult);
        
        if (!updateResult || !updateResult?.success) {
            return NextResponse.json({ error: 'Order Shipment update failed', details: updateResult?.error || 'Order Shipment update failed' }, { status: 400 });
        }
        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse'])
