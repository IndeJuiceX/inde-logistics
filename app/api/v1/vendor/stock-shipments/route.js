import { NextResponse } from 'next/server';
import { getAllStockShipments, getStockShipmentDetails } from '@/services/data/stock-shipment';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getVendorIdFromRequest } from '@/services/utils';
export const GET = withAuthAndLogging(async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        // let vendorId = user?.vendor || null;
        let vendorId = getVendorIdFromRequest(user,searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;

        if (!vendorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stockShipmentId = searchParams.get('stock_shipment_id') || null
        const page = parseInt(searchParams.get('page')) || 1;
        const pageSize = parseInt(searchParams.get('page_size')) || 20;
        let result;
        if (stockShipmentId) {
            result = await getStockShipmentDetails(vendorId, stockShipmentId);

        } else {
            result = await getAllStockShipments(vendorId, pageSize);
        }

        // // Paginate results
        // const startIndex = (page - 1) * pageSize;
        // const paginatedData = result.data.slice(startIndex, startIndex + pageSize);


        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed to fetch Stock Shipments' }, { status: 500 });
    }
}, ['vendor', 'admin','warehouse'])