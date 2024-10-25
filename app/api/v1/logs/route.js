import { NextResponse } from 'next/server';
import { getAllOrders, getOrderDetails } from '@/services/data/order';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getLogs } from '@/services/athena';
const handler = async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        // const vendorOrderId = searchParams.get('vendor_order_id');

        // const pageSize = parseInt(searchParams.get('page_size')) || 25;
        // const lastEvaluatedKeyParam = searchParams.get('last_evaluated_key');

        // let exclusiveStartKey = null;
        // if (lastEvaluatedKeyParam) {
        //     exclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKeyParam, 'base64').toString('utf-8'));
        // }

        let vendorId = user?.vendor;

        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let result = null;
        // if (vendorOrderId) {
        //     // Fetch specific order details
        //     result = await getOrderDetails(vendorId, vendorOrderId);
        // } else {
        //     // Fetch all orders with pagination
        //     result = await getAllOrders(vendorId, pageSize, exclusiveStartKey);
        // }
        try {
            const logs = await getLogs(vendorId); // Call the getLogs function with the vendorId
            return NextResponse.json(logs, { status: 200 }); // Return the logs in the response
        } catch (error) {
            return NextResponse.json({ message: `Failed to fetch logs: ${error.message}` }, { status: 500 });
        }

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export const GET = withAuthAndLogging(handler, ['vendor']); // Allowed roles: 'vendor'