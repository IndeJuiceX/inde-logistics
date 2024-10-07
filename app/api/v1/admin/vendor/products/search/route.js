import { NextResponse } from 'next/server';
import { searchProducts } from '@/services/data/product';  // Your search function
import { authenticateAndAuthorize } from '@/services/utils';  // Auth helper

export async function GET(request) {
  try {
    const { authorized, user, status } = await authenticateAndAuthorize(request);

    if (!authorized) {
      return NextResponse.json({ error: 'Access denied' }, { status });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 20;

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    console.log(' API CALL page is '+page+' SIZE IS '+pageSize)
    // Query paginated products
    const result = await searchProducts(query, vendorId, page, pageSize);
    // Return the results along with pagination data
    return NextResponse.json({
      products: result.data,
      pagination: result.pagination,  // Total number of products found
     /* page,
      pageSize*/
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}
