import { NextResponse } from 'next/server';
import { getAllOrders, getOrderDetails } from '@/services/data/order';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getVendorIdFromRequest } from '@/services/utils';

const handler = async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        const vendorOrderIdParam = searchParams.get('vendor_order_id');
        const MAX_ORDER_IDS = 10;
        // console.log('vender');

        const pageSize = parseInt(searchParams.get('page_size')) || 25;
        const lastEvaluatedKeyParam = searchParams.get('last_evaluated_key');

        let exclusiveStartKey = null;
        if (lastEvaluatedKeyParam) {
            exclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKeyParam, 'base64').toString('utf-8'));
        }

        let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;

        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let result = null;
        if (vendorOrderIdParam) {
            const vendorOrderIds = vendorOrderIdParam
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id);

            if (vendorOrderIds.length > MAX_ORDER_IDS) {
                return NextResponse.json(
                    { error: `Maximum of ${MAX_ORDER_IDS} vendor_order_id values allowed per request` },
                    { status: 400 }
                );
            }

            if (vendorOrderIds.length > 0) {
                // Fetch multiple orders
                result = await getMultipleOrdersByIds(vendorId, vendorOrderIds);
            } else {
                return NextResponse.json({ error: 'Invalid vendor_order_id parameter' }, { status: 400 });
            }
        } else {
            // Fetch all orders with pagination
            result = await getAllOrders(vendorId, pageSize, exclusiveStartKey);
        }

        if (result.success) {
            const response = {
                data: result.data,
                success: true,
            };

            if (result.lastEvaluatedKey) {
                response.last_evaluated_key = Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64');
            }
            if (result.hasMore !== undefined) {
                response.hasMore = result.hasMore;
            }

            return NextResponse.json(response, { status: 200 });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export const GET = withAuthAndLogging(handler, ['vendor', 'admin']); // Allowed roles: 'vendor'