import { NextResponse } from 'next/server';
import SchemaValidation from '@/services/products/SchemaValidation';
import { updateItem } from '@/services/dynamo/wrapper';
import { getProductByVendorSku } from '@/services/data/product';
import { decodeToken } from '@/services/Helper';
import { authenticateAndAuthorize } from '@/services/utils';
import { uploadToS3 } from '@/services/S3Helper';

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
    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json({ error: 'Invalid request format: Products field is required' }, { status: 400 });
    }

    // Validate the products
    const validationResults = SchemaValidation.validateProductUpdates(body.products);
    const validatedProducts = validationResults.validatedProducts;
    const invalidProducts = validationResults.errors;

    // Early return if all products fail validation
    if (validatedProducts.length === 0) {
      return NextResponse.json({
        error: 'Validation failed for all products',
        invalidProducts,  // Return all invalid products with error messages
      }, { status: 400 });
    }

    const updatedProducts = [];
    const failedUpdates = [];
    
    for (const product of validatedProducts) {
      const { vendor_sku, new_vendor_sku, ...updatedFields } = product;

      // Fetch the existing product by vendor_sku
      const result = await getProductByVendorSku(vendorId, vendor_sku);
      if (!result.success || !result.data) {
        failedUpdates.push({
          vendor_sku,
          error: `Product with SKU ${vendor_sku} not found`,
        });
        continue;  // Move to the next product
      }

      const existingProduct = result.data;
      const productUUID = existingProduct.sk.split('PRODUCT#')[1];

      // Prepare history versioning logic
      const historyArray = existingProduct.history || [];
      const historyVersion = historyArray.length + 1;
      const historyS3Key = `${vendorId}/product-history/${productUUID}/product-${historyVersion}.json`;

      // Prepare history object for tracking changes
      const historySnapshot = {
        timestamp: new Date().toISOString(),
        modified_by: user?.email || 'Vendor API token',
        changes: {},
        original_product: existingProduct,
      };

      const updateExpressions = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = { '#history': 'history' }; // Use expression attribute name for 'history'

      let hasUpdates = false;
      // Handle updates to fields other than vendor_sku
      for (const [key, value] of Object.entries(updatedFields)) {
        if (value !== existingProduct[key]) {
          updateExpressions.push(`#${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;
          expressionAttributeNames[`#${key}`] = key;

          historySnapshot.changes[`old_${key}`] = existingProduct[key];
          historySnapshot.changes[`new_${key}`] = value;
          hasUpdates = true;
        }
      }

      // If both vendor_sku and new_vendor_sku are present, update the SKU
      if (vendor_sku && new_vendor_sku && new_vendor_sku !== vendor_sku) {
        updateExpressions.push('vendor_sku = :new_vendor_sku');
        expressionAttributeValues[`:new_vendor_sku`] = new_vendor_sku;

        historySnapshot.changes.old_vendor_sku = vendor_sku;
        historySnapshot.changes.new_vendor_sku = new_vendor_sku;
        hasUpdates = true;
      }

      // If no fields have been updated, skip this product
      if (!hasUpdates) {
        failedUpdates.push({
          vendor_sku,
          error: 'No fields updated',
        });
        continue;
      }

      // Upload the history object to S3
      try {
        const fileUrl = await uploadToS3(historyS3Key, JSON.stringify(historySnapshot));
        console.log('Uploaded to S3:', fileUrl);
      } catch (error) {
        console.error('Failed to upload history to S3:', error);
        failedUpdates.push({
          vendor_sku,
          error: 'Failed to upload history to S3',
        });
        continue;
      }

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
        expressionAttributeNames  // Expression attribute names to avoid reserved keywords
      );

      if (!updateResult.success) {
        failedUpdates.push({
          vendor_sku,
          error: `Failed to update product ${vendor_sku}`,
        });
        continue;
      }

      updatedProducts.push({ vendor_sku, new_vendor_sku: new_vendor_sku || vendor_sku });
    }

    // Return summary of updates and any invalid/failed products
    return NextResponse.json({
      message: 'Products update process completed',
      updatedCount: updatedProducts.length,
      updatedProducts,
      failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined,
      invalidProducts: invalidProducts.length > 0 ? invalidProducts : undefined,
    }, { status: 200 });

  } catch (error) {
    console.log('Error in update-products endpoint:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
