import { NextResponse } from 'next/server';
import SchemaValidation from '@/services/products/SchemaValidation';
import { getItem, updateItem, batchWriteItems } from '@/lib/dynamodb';  // Import necessary DynamoDB functions
import { generateSK } from '@/services/products/Helper';  // Import the generateSK function
import { decodeToken } from '@/services/Helper';
import { authenticateAndAuthorize } from '@/services/utils';
import { uploadToS3 } from '@/services/S3Helper';  // Assuming this function helps you upload snapshots to S3

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
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json({ error: 'Invalid request format: Products field is required' }, { status: 400 });
    }

    const validatedProducts = SchemaValidation.validateProductUpdates(body.products);
    if (validatedProducts.validatedProducts.length === 0) {
      return NextResponse.json({
        error: 'Validation failed for all products',
        invalidProducts: validatedProducts.errors,
      }, { status: 400 });
    }

    const updatedProducts = [];
    for (const product of validatedProducts.validatedProducts) {
      const { vendor_sku, new_vendor_sku, ...updatedFields } = product;

      // Retrieve the existing product by vendor_sku
      const result = await getItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${vendor_sku}`);
      if (!result.success || !result.data) {
        return NextResponse.json({ error: `Product with SKU ${vendor_sku} not found` }, { status: 404 });
      }

      const existingProduct = result.data;
      const productUUID = existingProduct.sk.split('PRODUCT#')[1];

      // Create a snapshot of the current product and upload to S3
      const snapshotLink = await uploadToS3(existingProduct, `vendor/${vendorId}/products/${productUUID}/snapshot.json`);

      // Add the snapshot to the history attribute
      const productHistory = existingProduct.history || [];
      productHistory.push({ date: new Date().toISOString(), snapshot: snapshotLink });

      const updatedProduct = {
        ...existingProduct,
        ...updatedFields,
        history: productHistory,
      };

      // If vendor_sku is changing, mark the old SKU as inactive and create a new product with the new SKU
      if (new_vendor_sku && new_vendor_sku !== vendor_sku) {
        // Mark the old product as inactive
        const deactivateOldProduct = {
          ...existingProduct,
          status: 'Inactive',
        };
        await updateItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${vendor_sku}`, deactivateOldProduct);

        // Create a new product with the new SKU
        const newSK = `PRODUCT#${new_vendor_sku}`;
        updatedProduct.sk = newSK;
        updatedProduct.vendor_sku = new_vendor_sku;

        // Insert the new product with the updated SKU
        updatedProducts.push(updatedProduct);
      } else {
        // Update the existing product
        await updateItem(`VENDORPRODUCT#${vendorId}`, `PRODUCT#${vendor_sku}`, updatedProduct);
        updatedProducts.push(updatedProduct);
      }
    }

    // Batch insert updated products into DynamoDB
    const dbWriteResponse = await batchWriteItems(updatedProducts, 'Put');
    if (!dbWriteResponse.success) {
      return NextResponse.json({ error: 'Failed to update products in the database' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Products updated successfully',
      updatedCount: updatedProducts.length,
    }, { status: 200 });

  } catch (error) {
    console.log('Error in update-products endpoint:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
