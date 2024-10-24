import { NextResponse } from 'next/server';
import { queryItemCount } from '@/lib/dynamodb';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';

export const GET = withAuthAndLogging(async (request, { params, user }) => {


  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendor_id') || user.vendor;

  if (!vendorId) {
    return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
  }

  const result = await queryItemCount(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to fetch product count', details: result.error }, { status: 500 });
  }

  return NextResponse.json({ count: result.count });
}, ['vendor', 'admin'])
