import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { addBarcodeToProduct } from '@/services/data/product';
export const POST = withAuthAndLogging(async (request, { params, user }) => {
    try {
        // Extract authentication details
        const { searchParams } = new URL(request.url);


        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }


        const { vendor_id, vendor_sku, barcode } = body;

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !vendor_sku || !barcode) {
            return NextResponse.json({ error: 'vendor_id, vendor_sku and barcode are required' }, { status: 400 });
        }


        // Update the order's buyer information
        const updateResult = await addBarcodeToProduct(vendor_id, vendor_order_id, barcode);

        if (!updateResult || !updateResult?.success) {
            return NextResponse.json({ error: 'Product barcode update failed', details: updateResult?.error || 'Failed to add barcode to product' }, { status: 400 });
        }
        return NextResponse.json(updateResult, { status: 200 });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['warehouse'])
