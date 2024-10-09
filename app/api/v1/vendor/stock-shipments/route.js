import { NextResponse } from 'next/server';
import { getAllStockShipments } from '@/services/data/stock-shipment';

export async function GET(request, { params }) {
    try {

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId'); // Get the vendorId from the query params
        const page = parseInt(searchParams.get('page')) || 1;
        const pageSize = parseInt(searchParams.get('pageSize')) || 20;
        
        const result = await getAllStockShipments(vendorId, page, pageSize);
        console.log(result)
        // // Paginate results
        // const startIndex = (page - 1) * pageSize;
        // const paginatedData = result.data.slice(startIndex, startIndex + pageSize);


        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Stock Shipments' }, { status: 500 });
    }
}