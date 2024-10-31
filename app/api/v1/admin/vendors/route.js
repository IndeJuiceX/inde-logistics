// app/api/vendors/route.js
import { getAllVendors } from '@/services/data/vendor';
import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';

export const GET = withAuthAndLogging(async (request, { params, user }) => {
  try {
    // Assuming all vendors have "Vendor" as their EntityType
    const result = await getAllVendors();

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}, ['admin'])
