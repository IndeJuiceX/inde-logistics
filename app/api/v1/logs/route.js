import { NextResponse } from 'next/server';
import { getAllOrders, getOrderDetails } from '@/services/data/order';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getLogs } from '@/services/athena';
const handler = async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        // **Extract query parameters for filtering and pagination**
        let vendorId = user?.vendor;
        let logType = user?.role || 'vendor'
        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const status = searchParams.get('status'); // e.g., '200'
        const endpoint = searchParams.get('endpoint'); // e.g., '/api/v1/vendor/orders'
        const method = searchParams.get('method'); // e.g., 'GET'
        const limit = parseInt(searchParams.get('limit')) || 5; // Default to 100
        const nextToken = searchParams.get('nextToken'); // For pagination

        // **Call getLogs with filters and pagination params**
        try {
            const logsResponse = await getLogs({
                logType,
                vendorId,
                status,
                endpoint,
                method,
                limit,
                nextToken,
            });
            return NextResponse.json(logsResponse, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: `Failed to fetch logs: ${error.message}` }, { status: 500 });
        }



    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export const GET = withAuthAndLogging(handler, ['vendor']); // Allowed roles: 'vendor'