import { NextResponse } from 'next/server';
import { queryItemsWithPkAndSk } from '@/services/dynamo/wrapper';  // Your DynamoDB helper
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getAllVendorProducts } from '@/services/data/product';
export const GET = withAuthAndLogging(async (request, { params, user }) => {
  try {

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id') || user.vendor;
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('page_size')) || 25;



    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id parameter' }, { status: 400 });
    }

    // Query items for the given vendor
    const result = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#')//getAllVendorProducts(vendorId,pageSize, exclusiveStartKey)//await queryItems(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
    // If query failed, return an error
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch products', details: result.error }, { status: 500 });
    }

    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedData = result.data.slice(startIndex, startIndex + pageSize);

    return NextResponse.json(paginatedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}, ['vendor', 'admin'])
