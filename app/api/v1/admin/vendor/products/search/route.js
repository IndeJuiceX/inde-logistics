import { NextResponse } from 'next/server';
import { searchProducts } from '@/services/data/product';  // Your search function
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getVendorIdFromRequest } from '@/services/utils';
export const GET = withAuthAndLogging(async (request, { params, user }) => {
  try {


    const { searchParams } = new URL(request.url);
    let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;
    // const vendor_sku = searchParams.get('vendor_sku');
    const query = searchParams.get('q');
    const queryBy = searchParams.get('query_by');

    // console.log(brands)
    if (!vendorId) {
      // If the role is neither 'vendor' nor 'admin', return Forbidden
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!query || !queryBy) {
      return NextResponse.json({ error: 'q and query_by parameters are required' }, { status: 400 });

    }
    // Query paginated products
    // const result = await searchProducts(vendorId, query,brands, page, pageSize);  // stop the search function
    const result = await searchProducts(vendorId, query, queryBy);


    if (result && result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,

      }, { status: 200 });
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to search for products',
      details: result.error,

    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}, ['admin', 'warehouse'])
