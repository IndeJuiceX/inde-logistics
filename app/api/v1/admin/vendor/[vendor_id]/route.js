import { getVendorById } from '@/services/data/vendor';
import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
// Fetch the vendor by their ID
export const GET = withAuthAndLogging(async (request, { params, user }) => {
  try {
    const { vendor_id } = params; // Extract vendorId from the URL
    const vendorId = vendor_id
    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const result = await getVendorById(vendorId);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
},['admin'])
