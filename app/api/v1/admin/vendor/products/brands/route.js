import { NextResponse } from 'next/server';
import { getUniqueBrandNames } from '@/services/data/brand';  // Your DynamoDB helper
import { authenticateAndAuthorize } from '@/services/utils';  // Auth helper

export async function GET(request) {
  try {
    // Use the helper to authenticate and authorize the user
    const { authorized, user, status } = await authenticateAndAuthorize(request);

    // If not authorized, return an appropriate response
    if (!authorized) {
      return NextResponse.json({ error: 'Access denied' }, { status });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const pageSize = parseInt(searchParams.get('pageSize'), 10) || 5;

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    // Query items for the given vendor
    const result = await getUniqueBrandNames(vendorId);
    
    // If query failed, return an error
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch Brands', details: result.error }, { status: 500 });
    }

    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedData = result.data.slice(startIndex, startIndex + pageSize);

    return NextResponse.json(paginatedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}
