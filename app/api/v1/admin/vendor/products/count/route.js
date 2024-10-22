import { NextResponse } from 'next/server';
import { queryItemCount } from '@/lib/dynamodb';
import { withAuthAndRole } from '@/services/utils/auth';

export const GET = withAuthAndRole(async (request, { params, user }) => {
  

  // Return the appropriate response based on the authorization result
  if (!user) {
    return NextResponse.json({ error: 'Access denied' }, { status });
  }

  console.log(user)
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId')||user.vendorId;

  if (!vendorId) {
    return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
  }

  const result = await queryItemCount(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to fetch product count', details: result.error }, { status: 500 });
  }

  return NextResponse.json({ count: result.count });
},['vendor','admin'])
