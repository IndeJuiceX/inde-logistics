import { NextResponse } from 'next/server';
// import SchemaValidation from '@/services/products/SchemaValidation';
import { validateStockShipmentItems } from '@/services/schema';
import { decodeToken } from '@/services/utils/token';
import { authenticateAndAuthorize } from '@/services/utils';
import { createStockShipment } from '@/services/data/stock-shipment';


const MAX_SIZE_MB = 2 * 1024 * 1024;  // 2MB in bytes

export async function POST(request) {
    try {
        // Extract authentication details
        const { authorized, user } = await authenticateAndAuthorize(request);

        if (!authorized) {
            const apiToken = request.headers.get('Authorization')?.split(' ')[1];  // Bearer token
            if (!apiToken) {
                return NextResponse.json({ error: 'Missing API token' }, { status: 401 });
            }
            const decoded = decodeToken(apiToken);
            if (!decoded) {
                return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
            }
            user.vendor = decoded.vendorId;
        }

        const vendorId = user.vendor;

        // Parse request body
        const bodyText = await request.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
        }

        if (bodyText.length > MAX_SIZE_MB) {
            return NextResponse.json(
                { error: `Payload exceeds size limit of ${MAX_SIZE_MB / (1024 * 1024)}MB` },
                { status: 413 }
            );
        }

        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
        }

        // Ensure Products field exists and is an array
        if (!body.stock_shipment || !Array.isArray(body.stock_shipment)) {
            return NextResponse.json({ error: 'Invalid request format: stock_shipment field is required' }, { status: 400 });
        }

        // Validate the stock shipment items
        const validationResult = /*SchemaValidation.*/validateStockShipmentItems(body.stock_shipment);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed for some items', invalidItems: validationResult.errors },
                { status: 400 }
            );
        }

        const validItems = validationResult.validatedItems;
        const stockShipmentResult = await createStockShipment(vendorId, validItems);

        if (!stockShipmentResult.success) {
            return NextResponse.json(
                { error: stockShipmentResult.error, invalidItems: stockShipmentResult.invalidItems },
                { status: 400 }
            );
        }

        // Return success response
        return NextResponse.json(
            { message: stockShipmentResult.message, shipment_id: stockShipmentResult.shipment_id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }

}