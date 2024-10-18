import { NextResponse } from 'next/server';
import { getStockShipmentDetails } from '@/services/data/stock-shipment';
import { getAllOrders } from '@/services/data/order';

export async function GET(request, { params }) {
    try {

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId'); // Get the vendorId from the query params

        const page = parseInt(searchParams.get('page')) || 1;
        const pageSize = parseInt(searchParams.get('pageSize')) || 25;

        const result = await getAllOrders(vendorId);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to fetch orders', details: result.error }, { status: 500 });
        }
        return NextResponse.json(result, { status: 200 });

        const startIndex = (page - 1) * pageSize;
        const paginatedData = result.data.slice(startIndex, startIndex + pageSize);
        console.log(paginatedData);
        return NextResponse.json(paginatedData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Stock Shipments' }, { status: 500 });
    }
}