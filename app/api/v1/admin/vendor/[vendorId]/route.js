import { getVendorById } from '@/services/data/vendor';
import { NextResponse } from 'next/server';

// Fetch the vendor by their ID
export async function GET(request, { params }) {
  try {
    const { vendorId } = params; // Extract vendorId from the URL

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
}
