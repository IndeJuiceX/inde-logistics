import { NextResponse } from 'next/server';
// import SchemaValidation from '@/services/products/SchemaValidation';
import { validateStockShipmentItems } from '@/services/schema';
import { withAuthAndRole } from '@/services/utils/auth';
import { updateStockShipment, getStockShipmentById } from '@/services/data/stock-shipment';

const MAX_SIZE_MB = 2 * 1024 * 1024;  // 2MB in bytes

export const PATCH = withAuthAndRole(async (request, { params, user }) => {
  try {
    let vendorId = user?.vendor || null;
    if (!vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Ensure stock_shipment field exists and is an object
    if (!body.stock_shipment || typeof body.stock_shipment !== 'object') {
      return NextResponse.json({ error: 'Invalid request format: stock_shipment field is required and must be an object' }, { status: 400 });
    }

    const { stock_shipment_id, items } = body.stock_shipment;

    // Validate that stock_shipment_id is present
    if (!stock_shipment_id) {
      return NextResponse.json({ error: 'stock_shipment_id is required' }, { status: 400 });
    }

    // Validate that items field exists and is an array
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request format: items field is required and must be an array' }, { status: 400 });
    }

    // Check if the shipment exists and belongs to the vendor
    const shipmentExists = await checkShipmentExists(vendorId, stock_shipment_id);
    if (!shipmentExists) {
      return NextResponse.json({ error: 'Shipment not found or does not belong to the vendor' }, { status: 404 });
    }

    // Validate the stock shipment items
    const validationResult = /*SchemaValidation.*/validateStockShipmentItems(items);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed for some items', invalidItems: validationResult.errors },
        { status: 400 }
      );
    }

    const validItems = validationResult.validatedItems;

    // Update the stock shipment
    const stockShipmentResult = await updateStockShipment(vendorId, stock_shipment_id, validItems);

    if (!stockShipmentResult.success) {
      return NextResponse.json(
        { error: stockShipmentResult.error },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: stockShipmentResult.message, shipment_id: stockShipmentResult.shipment_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}, ['vendor'])

async function checkShipmentExists(vendorId, stock_shipment_id) {
  const shipmentData = await getStockShipmentById(vendorId, stock_shipment_id);
  return shipmentData.success && shipmentData.data.length > 0;
}