import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { updateOrderShipment} from '@/services/data/order-shipment';
export const PATCH = withAuthAndLogging(async (request, { params, user }) => {
    try {

        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }


        const { vendor_id, vendor_order_id, error_reason } = body;

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !vendor_order_id) {
            return NextResponse.json({ error: 'vendor_id, vendor_order_id, and item are required' }, { status: 400 });
        }

        // Prepare the arguments array
        // const args = [vendor_id, vendor_order_id];
        // if (error_reason && error_reason != '' && error_reason !== undefined) {
        //     args.push(error_reason);
        // }

        let isError = false
        if (error_reason && error_reason != '' && error_reason !== undefined) {
            //args.push(error_reason);
            isError= true
        }
        const updatedFields = {}
        if(isError){
            updatedFields.error = 1
            updatedFields.error_reason = error_reason
        }


        // Update the order's buyer information
        const updateResult = await updateOrderShipment(vendor_id,vendor_order_id, updatedFields);

        if (!updateResult || !updateResult?.success) {
            return NextResponse.json({ error: 'Order Shipment error update failed', details: updateResult?.error || 'Order Shipment error update failed' }, { status: 400 });
        }
        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse'])
