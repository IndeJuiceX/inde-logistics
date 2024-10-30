import { NextResponse } from 'next/server';
import { validateOrder } from '@/services/schema';  // Changed to validateOrder
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { toggleVendorStatus } from '@/services/data/vendor';  // Changed to saveVendor

const MAX_SIZE_BYTES = 2 * 1024 * 1024;  // 2MB in bytes

export const POST = withAuthAndLogging(async (request, { params, user }) => {
    try {

        const { vendorId } = params;

        console.log('Vendor ID:', vendorId);

        // Parse request body
        const bodyText = await request.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
        }

        let vendor;
        try {
            vendor = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        const venderUpdate = await toggleVendorStatus(vendorId, vendor.status);
        console.log('Vendor updated:', venderUpdate);

        return NextResponse.json(venderUpdate, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['admin'])
