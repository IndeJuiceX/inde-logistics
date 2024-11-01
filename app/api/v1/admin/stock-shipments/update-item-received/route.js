import { NextResponse } from 'next/server';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { checkShipmentExists } from '@/services/data/stock-shipment';
import { updateStockShipmentItemReceived } from '@/services/data/stock-shipment-item';

export const PATCH = withAuthAndLogging(async (request, { params, user }) => {
    try {
        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }


        const { vendor_id, stock_shipment_id, item } = body;

        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !stock_shipment_id || !item) {
            return NextResponse.json({ error: 'vendor_id, stock_shipment_id, and item are required' }, { status: 400 });
        }

        const { vendor_sku, received, faulty } = item;

        // Validate that vendor_sku, received, and faulty fields are present in the item
        if (!vendor_sku || received === undefined || faulty === undefined) {
            return NextResponse.json({ error: 'vendor_sku, received, and faulty fields are required in the item' }, { status: 400 });
        }

        // Check if the shipment exists and belongs to the vendor
        const shipmentExists = await checkShipmentExists(vendor_id, stock_shipment_id);
        if (!shipmentExists) {
            return NextResponse.json({ error: 'Shipment not found or does not belong to the vendor' }, { status: 404 });
        }

        // Update the stock shipment item
        const updateResult = await updateStockShipmentItemReceived(vendor_id, stock_shipment_id, { vendor_sku, received, faulty });

        if (!updateResult.success) {
            return NextResponse.json({ error: 'Failed to update stock shipment item', details: updateResult.error }, { status: 400 });
        }

        return NextResponse.json({ message: 'Stock shipment item updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}, ['admin', 'warehouse']);