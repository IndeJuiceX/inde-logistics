import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { checkShipmentExists, getStockShipmentById } from '@/services/data/stock-shipment';
import { getUnshelvedItemsFromStockShipment } from '@/services/data/stock-shipment-item';
import { getVendorIdFromRequest } from '@/services/utils';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        // let vendorId = user?.vendor || null;
        let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;

        if (!vendorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stockShipmentId = searchParams.get('stock_shipment_id') || null
       

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!stockShipmentId ) {
            return NextResponse.json({ error: ' stock_shipment_id is required' }, { status: 400 });
        }


        // Update the stock shipment item
        const unshelvedResult = await getUnshelvedItemsFromStockShipment(vendorId, stockShipmentId);
        // console.log('unshelvedResult', unshelvedResult);
        
        if (!unshelvedResult.success) {
            return NextResponse.json({ error: 'Failed to get unshelved stock shipment items', details: unshelvedResult.error }, { status: 400 });
        }

        return NextResponse.json(unshelvedResult, { status: 200 });

    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['admin', 'warehouse']);