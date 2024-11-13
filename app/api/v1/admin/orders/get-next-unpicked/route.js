import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getNextUnPickedOrder } from '@/services/data/order';
import { getUnshelvedItemsFromStockShipment } from '@/services/data/stock-shipment-item';
import { getVendorIdFromRequest } from '@/services/utils';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
    try {
        // const { searchParams } = new URL(request.url);
        // // let vendorId = user?.vendor || null;
        // let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;

        // if (!vendorId) {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

     
       

        


        // Update the stock shipment item
        const unPickedResult = await getNextUnPickedOrder();

        if (!unPickedResult.success) {
            return NextResponse.json({ error: 'Failed to get unpicked order items', details: unPickedResult.error }, { status: 400 });
        }

         return NextResponse.json(unPickedResult, { status: 200 });

    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['admin', 'warehouse']);