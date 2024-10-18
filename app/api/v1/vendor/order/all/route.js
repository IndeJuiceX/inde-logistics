import { NextResponse } from 'next/server';
import { getAllOrders } from '@/services/data/order';

export async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const pageSize = parseInt(searchParams.get('pageSize')) || 25;
        const lastEvaluatedKeyParam = searchParams.get('lastEvaluatedKey');

        let exclusiveStartKey = null;
        if (lastEvaluatedKeyParam) {
            exclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKeyParam, 'base64').toString('utf-8'));
        }

        const result = await getAllOrders(vendorId, pageSize, exclusiveStartKey);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to fetch orders', details: result.error },
                { status: 500 }
            );
        }

        const nextLastEvaluatedKey = result.lastEvaluatedKey
            ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
            : null;

        return NextResponse.json(
            {
                data: result.data,
                lastEvaluatedKey: nextLastEvaluatedKey,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
