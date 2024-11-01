import { NextResponse } from 'next/server';
// import SchemaValidation from '@/services/products/SchemaValidation';

import { validateVendorSkuArray } from '@/services/schema';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { checkShipmentExists } from '@/services/data/stock-shipment';
import { removeItemsFromStockShipment } from '@/services/data/stock-shipment-item';
import { deleteStockShipmentWithItems } from '@/services/data/stock-shipment';
import { getVendorIdFromRequest } from '@/services/utils';

const MAX_SIZE_MB = 2 * 1024 * 1024;  // 2MB in bytes

export const DELETE = withAuthAndLogging(async (request, { params, user }) => {
  try {
    // Extract authentication details
    let vendorId = getVendorIdFromRequest(user,searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;


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

    
    const { stock_shipment_id, items } = body//.stock_shipment;

    // Validate that stock_shipment_id is present
    if (!stock_shipment_id) {
      return NextResponse.json({ error: 'stock_shipment_id is required' }, { status: 400 });
    }

    if (!items) {
      const res = await deleteStockShipmentWithItems(vendorId, stock_shipment_id)
      
      if (res.success) {
        return NextResponse.json(
          { message: 'Stock Shipment Deleted Successfully' },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete stock shipment', details: res?.error || [] },
        { status: 400 }
      );
    }

    // Validate that items field exists and is an array
    if (items && !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request format: items field is required and must be an array' }, { status: 400 });
    }

    // Check if the shipment exists and belongs to the vendor
    const shipmentExists = await checkShipmentExists(vendorId, stock_shipment_id);
    if (!shipmentExists) {
      return NextResponse.json({ error: 'Shipment not found or does not belong to the vendor' }, { status: 404 });
    }

    // Validate the stock shipment items
    const validationResult = /*SchemaValidation.*/validateVendorSkuArray(items);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed for some items', details: validationResult.errors },
        { status: 400 }
      );
    }

    const validItems = validationResult.validatedItems;

    // Update the stock shipment
    const stockShipmentResult = await removeItemsFromStockShipment(vendorId, stock_shipment_id, validItems);

    if (!stockShipmentResult.success) {
      return NextResponse.json(
        { error: stockShipmentResult.error, details: stockShipmentResult?.details || [] },
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

