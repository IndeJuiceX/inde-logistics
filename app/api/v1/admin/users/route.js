import { NextResponse } from 'next/server';
import { queryItems } from '@/lib/dynamodb';  // Your DynamoDB helper

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const pageSize = parseInt(searchParams.get('pageSize'), 10) || 5;

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    const result = await queryItems(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
    
    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedData = result.data.slice(startIndex, startIndex + pageSize);

    return NextResponse.json(paginatedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}