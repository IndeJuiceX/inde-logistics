import { NextResponse } from 'next/server';
import SchemaValidation from '@/services/products/SchemaValidation';
import { batchWriteItems, getItem } from '@/lib/dynamodb';
import { generateSK } from '@/services/products/Helper';  // Import the generateSK function
import { decodeToken } from '@/services/Helper';

// Constants for validation
const MAX_SIZE_MB = 5 * 1024 * 1024;  // 5MB in bytes
const MAX_PRODUCTS = 5000;  // Max products allowed in a batch

export async function POST(request) {
  try {
    // Extract API token from headers
    const apiToken = request.headers.get('Authorization')?.split(' ')[1];  // Bearer token
    if (!apiToken) {
      return NextResponse.json({ error: 'Missing API token' }, { status: 401 });
    }

    const decoded = decodeToken(apiToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Lookup vendor by API token
    const result = await getItem(`VENDOR#${decoded.vendorId}`, `VENDOR#${decoded.vendorId}`);
    if (!result.success) {
      return NextResponse.json({ error: 'Vendor not found or inactive' }, { status: 403 });
    }

    const vendor = result.data;
    if (!vendor || vendor.Status !== 'Active') {
      return NextResponse.json({ error: 'Vendor is inactive or not found' }, { status: 403 });
    }

    const vendorId = vendor.PK;

    // Parse the request body
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

    // Try to parse JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    // Ensure Products field exists and is an array
    if (!body.Products || !Array.isArray(body.Products)) {
      return NextResponse.json({ error: 'Invalid request format: Products field is required' }, { status: 400 });
    }

    // Check product count limit
    if (body.Products.length > MAX_PRODUCTS) {
      return NextResponse.json({ error: `Product limit exceeded. Max allowed: ${MAX_PRODUCTS}` }, { status: 400 });
    }

    // Validate the products
    const validationResults = SchemaValidation.validateProducts(body.Products);
    if (!validationResults.success) {
      return NextResponse.json(
        { error: 'Validation failed for some products', details: validationResults.errors },
        { status: 400 }
      );
    }

    // Prepare products for insertion
    const validatedProducts = validationResults.validatedProducts.map((product) => {
      const sk = generateSK(vendorId, product.VendorSku);
      return {
        PK: vendorId,
        SK: sk,
        EntityType: 'Product',
        VendorSku: product.VendorSku,
        Status: product.Status,
        Stock: product.Stock,
        Details: product.Details,
      };
    });

    // Call DynamoDB batch write
    const dbWriteResponse = await batchWriteItems(validatedProducts, 'Put');

    if (!dbWriteResponse.success) {
      return NextResponse.json({ error: 'Failed to save products to database', details: dbWriteResponse.error }, { status: 500 });
    }

    const {
      added = [],
      errors = []
    } = dbWriteResponse.results || {};

    return NextResponse.json({
      message: 'Products uploaded successfully',
      addedCount: added.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in /upload-products endpoint:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



