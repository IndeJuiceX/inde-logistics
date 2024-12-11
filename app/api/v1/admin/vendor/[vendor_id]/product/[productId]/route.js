// app/api/v1/admin/vendor/[vendorId]/product/[productUUID]/route.js
import { getProductById } from '@/services/data/product';
import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
    const { vendorId, productId } = params;

    try {
        const result = await getProductById(vendorId, productId);
        // console.log('Product data:', result);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }
        return NextResponse.json(result.data, { status: 200 });
    } catch (error) {
        console.error('Error in GET /product:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
},['admin'])
