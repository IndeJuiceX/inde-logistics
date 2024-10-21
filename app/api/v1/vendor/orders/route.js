import { NextResponse } from 'next/server';
import { getAllOrders, getOrderDetails } from '@/services/data/order';
import { authenticateAndAuthorize } from '@/services/utils';

export async function GET(request, { params }) {
    try {
        const { authorized, user, status } = await authenticateAndAuthorize(request);

        if (!authorized || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: status });
        }

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const vendorOrderId = searchParams.get('vendor_order_id');

        const pageSize = parseInt(searchParams.get('pageSize')) || 25;
        const lastEvaluatedKeyParam = searchParams.get('lastEvaluatedKey');

        let exclusiveStartKey = null;
        if (lastEvaluatedKeyParam) {
            exclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKeyParam, 'base64').toString('utf-8'));
        }

        let result = null;
        if (vendorOrderId) {
            result = await getOrderDetails(user.vendorId, vendorOrderId);
        } else {
            result = await getAllOrders(user.vendorId, pageSize, exclusiveStartKey);
        }

        if (result.success) {
            const response = {
                data: result.data,
            };

            if (result.lastEvaluatedKey) {
                response.lastEvaluatedKey = Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64');
            }

            return NextResponse.json(response, { status: 200 });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }


        return NextResponse.json(
            { error: 'Failed to fetch orders', details: result.error },
            { status: 500 }
        );
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}