import { NextResponse } from 'next/server';
import { validateProductUpdates } from '@/services/schema';
import { updateItem, updateOrInsert } from '@/services/external/dynamo/wrapper';
import { getProductById } from '@/services/data/product';
import { uploadToS3 } from '@/services/external/s3';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { getVendorIdFromRequest } from '@/services/utils';


const MAX_SIZE_MB = 2 * 1024 * 1024;  // 2MB in bytes

export const PATCH = withAuthAndLogging(async (request, { params, user }) => {
    try {


        let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;
        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
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

        // Ensure Products field exists and is an array
        if (!body.products || !Array.isArray(body.products)) {
            return NextResponse.json({ error: 'Invalid request format: Products field is required' }, { status: 400 });
        }

        // Validate the products (removing any "pk" or "sk" fields if passed)
        const validationResults = validateProductUpdates(body.products);
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
        console.log(validatedProducts)
        for (const product of validatedProducts) {
            const { vendor_sku, ...updatedFields } = product;
            // Fetch the existing product by vendor_sku
            const result = await getProductById(vendorId, vendor_sku)//await getProductByVendorSku(vendorId, vendor_sku);
            if (!result.success || !result.data) {
                failedUpdates.push({
                    vendor_sku,
                    error: `Product with SKU ${vendor_sku} not found`,
                });
                continue;  // Move to the next product
            }

            const existingProduct = result.data;
            const productUUID = result.data.vendor_sku//existingProduct.sk.split('PRODUCT#')[1];

            // Prepare update expressions for DynamoDB
            const updateExpressions = {};

            let hasUpdates = false;
            // Handle updates to fields other than vendor_sku
            for (const [key, value] of Object.entries(updatedFields)) {
                if (value !== existingProduct[key]) {
                    updateExpressions[key] = value;
                    hasUpdates = true;
                }
            }


            // If no fields have been updated, skip this product
            if (!hasUpdates) {
                failedUpdates.push({
                    vendor_sku,
                    error: 'No fields updated',
                });
                continue;
            }
            // Update the product in DynamoDB
            // Call the updated updateItem function
            const updateResult = await updateItem(
                `VENDORPRODUCT#${vendorId}`,
                `PRODUCT#${productUUID}`,
                updateExpressions
            );

            console.log('FIRST UPDATE RESULT')
            console.log(updateResult)

            if (!updateResult.success) {
                failedUpdates.push({
                    vendor_sku,
                    error: `Failed to update product ${vendor_sku}`,
                });
                continue;
            }

            // If update is successful, then upload the history to S3
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

            // Capture the changes in history
            for (const [key, value] of Object.entries(updatedFields)) {
                if (value !== existingProduct[key]) {
                    historySnapshot.changes[`old_${key}`] = existingProduct[key];
                    historySnapshot.changes[`new_${key}`] = value;
                }
            }

            try {

                const fileUrl = await uploadToS3(historyS3Key, JSON.stringify(historySnapshot));

                const historyUpdateResult = await updateOrInsert(
                    `VENDORPRODUCT#${vendorId}`,
                    `PRODUCT#${productUUID}`,
                    { history: [historyS3Key] },  // List append fields (like history)
                    { '#history': 'history' }  // Reserved keyword for 'history'
                );
                console.log('HISTORY UPDATE RESULT---')
                console.log(historyUpdateResult)
                if (!historyUpdateResult.success) {
                    console.error('Failed to append history to DynamoDB:', historyUpdateResult.error);
                    failedUpdates.push({
                        vendor_sku,
                        error: 'Failed to upload history to S3',
                    });
                }

            } catch (error) {
                console.error('Failed to upload history to S3:', error);
                failedUpdates.push({
                    vendor_sku,
                    error: 'Failed to upload history to S3',
                });
                continue;
            }

            updatedProducts.push({ vendor_sku });
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
        console.log(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}, ['vendor'])
