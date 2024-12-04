import { NextResponse } from 'next/server';
import { getVendorUsers } from '@/services/data/user';  // Your DynamoDB helper

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const { vendor_id } = params;
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const pageSize = parseInt(searchParams.get('pageSize'), 10) || 5;


    const result = await getVendorUsers(vendor_id);

    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedData = result.data.slice(startIndex, startIndex + pageSize);

    return NextResponse.json(paginatedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}