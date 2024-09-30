import { NextResponse } from 'next/server';
import SchemaValidation from '@/services/products/SchemaValidation';
import { updateItem } from '@/services/dynamo/wrapper';
import { getProductByVendorSku } from '@/services/data/product';
import { decodeToken } from '@/services/Helper';
import { authenticateAndAuthorize } from '@/services/utils';
import { uploadToS3 } from '@/services/S3Helper';

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

    // Validate incoming product data
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

      // Fetch the existing product by vendor_sku
      const result = await getProductByVendorSku(`VENDORPRODUCT#${vendorId}`, vendor_sku);
      if (!result.success || !result.data) {
        return NextResponse.json({ error: `Product with SKU ${vendor_sku} not found` }, { status: 404 });
      }
      const existingProduct = result.data;
      const productUUID = existingProduct.sk.split('PRODUCT#')[1];

      // Prepare history versioning logic
      const historyArray = existingProduct.history || [];
      const historyVersion = historyArray.length + 1;
      const historyS3Key = `history/${vendorId}/product-${historyVersion}.json`;

      // Prepare history object for tracking changes
      const historySnapshot = {
        timestamp: new Date().toISOString(),
        modified_by: user.email,
        changes: {},
        original_product: existingProduct,
      };

      const updateExpressions = [];
      const expressionAttributeValues = {};

      // Handle updates to fields other than vendor_sku
      for (const [key, value] of Object.entries(updatedFields)) {
        if (value !== existingProduct[key]) {
          updateExpressions.push(`${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;

          historySnapshot.changes[`old_${key}`] = existingProduct[key];
          historySnapshot.changes[`new_${key}`] = value;
        }
      }

      // If both vendor_sku and new_vendor_sku are present, update the SKU
      if (vendor_sku && new_vendor_sku && new_vendor_sku !== vendor_sku) {
        updateExpressions.push(`vendor_sku = :new_vendor_sku`);
        expressionAttributeValues[`:new_vendor_sku`] = new_vendor_sku;

        historySnapshot.changes.old_vendor_sku = vendor_sku;
        historySnapshot.changes.new_vendor_sku = new_vendor_sku;
      }

      // Upload the history object to S3
      await uploadToS3(historyS3Key, JSON.stringify(historySnapshot));

      // Add the S3 link to the history array in DynamoDB
      updateExpressions.push('SET #history = list_append(if_not_exists(#history, :empty_list), :history)');
      expressionAttributeValues[':history'] = [historyS3Key];
      expressionAttributeValues[':empty_list'] = [];

      // Update the product in DynamoDB
      const updateResult = await updateItem(
        `VENDORPRODUCT#${vendorId}`,
        `PRODUCT#${productUUID}`,
        updateExpressions.join(', '),  // Update expression
        expressionAttributeValues,  // Values to update
        { '#history': 'history' }  // Expression attribute names to avoid reserved keywords
      );

      if (!updateResult.success) {
        return NextResponse.json({ error: `Failed to update product ${vendor_sku}` }, { status: 500 });
      }

      updatedProducts.push(updatedProduct);
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
