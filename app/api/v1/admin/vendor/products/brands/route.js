import { NextResponse } from 'next/server';
import { getUniqueBrandNames } from '@/services/data/brand';  // Import the updated function
import { authenticateAndAuthorize } from '@/services/utils';  // Auth helper

export async function GET(request) {
  try {
    // Authenticate and authorize the user
    const { authorized, user, status } = await authenticateAndAuthorize(request);

    // If not authorized, return an appropriate response
    if (!authorized) {
      return NextResponse.json({ error: 'Access denied' }, { status });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const searchTerm = searchParams.get('searchTerm') || '';
    const size = 20;  // Limit to 20 brands

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    // Fetch unique brand names
    const result = await getUniqueBrandNames(vendorId, size, searchTerm);

    // If query failed, return an error
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch brands', details: result.error }, { status: 500 });
    }

    // Return the brand names and whether more brands are available
    return NextResponse.json({
      brands: result.data,
      hasMoreBrands: result.hasMoreBrands,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}
