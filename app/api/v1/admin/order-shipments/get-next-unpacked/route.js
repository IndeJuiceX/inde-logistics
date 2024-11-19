import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getNextUnPackedOrderShipment } from '@/services/data/order-shipment';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
    try {
    
        const unPickedResult = await getNextUnPackedOrderShipment();

        if (!unPickedResult.success) {
            return NextResponse.json({ error: 'Failed to get unpacked order items', details: unPickedResult.error }, { status: 400 });
        }

         return NextResponse.json(unPickedResult, { status: 200 });

    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse']);