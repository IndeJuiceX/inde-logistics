import { NextResponse } from 'next/server';
import { queryItemCount } from '@/lib/dynamodb';  // Your DynamoDB helper

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
 
    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    const result = await queryItemCount(`VENDOR#${vendorId}`, 'PRODUCT#');

    // Check if the query was successful
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch product count', details: result.error }, { status: 500 });
    }

    // Return the total product count
    return NextResponse.json({ count: result.count });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error', details: error.message }, { status: 500 });
  }
}
