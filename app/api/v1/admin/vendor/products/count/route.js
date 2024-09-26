import { NextResponse } from 'next/server';
import { queryItemCount } from '@/lib/dynamodb';
import { authenticateAndAuthorize } from '@/services/utils';

export async function GET(request) {
  const { authorized, user, status } = await authenticateAndAuthorize(request);

  // Return the appropriate response based on the authorization result
  if (!authorized) {
    return NextResponse.json({ error: 'Access denied' }, { status });
  }

  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
  }

  const result = await queryItemCount(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to fetch product count', details: result.error }, { status: 500 });
  }

  return NextResponse.json({ count: result.count });
}
