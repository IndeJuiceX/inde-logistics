import { NextResponse } from 'next/server';
import { getOrderDetails } from '@/services/data/order';
import { authenticateAndAuthorize } from '@/services/utils';
export async function GET(request, { params }) {
    try {

        const { vendorOrderId } = params;
        console.log('GET ORDER DETAILS API---')
        const { authorized, user } = await authenticateAndAuthorize(request);
        console.log(authorized)
        console.log(user)

        let vendorId = user?.vendor || null;
        if (!authorized || vendorId == null) {
            const apiToken = request.headers.get('Authorization')?.split(' ')[1];  // Bearer token
            if (!apiToken) {
                return NextResponse.json({ error: 'Missing API token' }, { status: 401 });
            }
            const decoded = decodeToken(apiToken);
            console.log(decoded)
            if (!decoded) {
                return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
            }
            vendorId = decoded.vendorId;
        }

        const result = await getOrderDetails(vendorId, vendorOrderId);

        console.log(result)
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Stock Shipments' }, { status: 500 });
    }
}