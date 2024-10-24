import { NextResponse } from 'next/server';
import { getAllOrders, getOrderDetails } from '@/services/data/order';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getAllVendorProducts, getProductById } from '@/services/data/product';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
    try {
        const { searchParams } = new URL(request.url);
        const vendorSku = searchParams.get('vendor_sku');

        const pageSize = parseInt(searchParams.get('page_size')) || 25;
        const lastEvaluatedKeyParam = searchParams.get('last_evaluated_key');

        let exclusiveStartKey = null;
        if (lastEvaluatedKeyParam) {
            exclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKeyParam, 'base64').toString('utf-8'));
        }

        let vendorId = user?.vendor;

        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let result = null;
        if (vendorSku) {
            // Fetch specific order details
            result = await getProductById(vendorId, vendorSku);
        } else {
            // Fetch all products with pagination
            result = await getAllVendorProducts(vendorId, pageSize, exclusiveStartKey);
        }
        console.log(result)
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
}, ['vendor']); // Allowed roles