import { NextResponse } from 'next/server';
//import SchemaValidation from '@/services/products/SchemaValidation';
import { validateProducts } from '@/services/schema';
import { batchWriteItems, getItem } from '@/lib/dynamodb';
import { withAuthAndLogging } from '@/services/utils/apiMiddleware';
import { generateProductId } from '@/services/utils'
import { getVendorIdFromRequest } from '@/services/utils';

// Constants for validation
const MAX_SIZE_MB = 2 * 1024 * 1024;  // 5MB in bytes
const MAX_PRODUCTS = 500;  // Max products allowed in a batch

export const POST = withAuthAndLogging(async (request, { params, user }) => {
    try {
        // Extract API token from headers
        const { searchParams } = new URL(request.url);

        let vendorId = getVendorIdFromRequest(user, searchParams)//user.role === 'admin' ? searchParams.get('vendor_id') : user?.vendor;
        if (!vendorId) {
            // If the role is neither 'vendor' nor 'admin', return Forbidden
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Lookup vendor by API token
        const result = await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`);
        if (!result.success || result?.data?.status.toLowerCase() !== 'active') {
            return NextResponse.json({ error: 'Vendor not found or inactive' }, { status: 403 });
        }

        const vendor = result.data;
        if (!vendor || vendor.status.toLowerCase() !== 'active') {
            return NextResponse.json({ error: 'Vendor is inactive or not found' }, { status: 403 });
        }

        // const vendorIdPk = vendor.pk;
        // console.log('VENDOR ID IS ' + vendorId);
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
        if (!body.products || !Array.isArray(body.products)) {
            return NextResponse.json({ error: 'Invalid request format: Products field is required' }, { status: 400 });
        }

        ;
        const validationResults = validateProducts(body.products);

        const validatedProducts = validationResults.validatedProducts;
        const invalidProducts = validationResults.errors;

        if (validatedProducts.length === 0) {
            return NextResponse.json({
                error: 'Validation failed for all products',
                invalidProducts,  // Return all invalid products with error messages
            }, { status: 400 });
        }

        console.log('TOTAL VALID PRODUCTS = ' + validatedProducts.length);

        // Prepare products for insertion
        const productsToInsert = validationResults.validatedProducts.map((product) => {
            const sk = `PRODUCT#${product.vendor_sku}`//generateSK(vendorId, product.vendor_sku);
            const productId = generateProductId(vendorId, product.vendor_sku)//sk.split('VENDOR#')[1];

            return {
                pk: 'VENDORPRODUCT#' + vendor.vendor_id,
                sk: sk,
                entity_type: 'Product',
                product_id: productId,
                stock_available: process.env.APP_ENV != 'production' ? Math.floor(Math.random() * 50) : 0,
                name: product.name?.toLowerCase(),
                brand_name: product.brand_name?.toLowerCase(),
                ...product
            };
        });
        console.log('TOTAL VALID PRODUCTS TO INSERT BEFORE WRITE COMMAND = ' + productsToInsert.length);
        // Call DynamoDB batch write
        const dbWriteResponse = await batchWriteItems(productsToInsert, 'Put');

        console.log(dbWriteResponse);
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
            failedProducts: errors.length > 0 ? errors : undefined,
            invalidProducts: invalidProducts.length > 0 ? invalidProducts : undefined,  // Products that failed validation

        }, { status: 200 });
    } catch (error) {
        // console.error('Error in /upload-products endpoint:', error);
        console.log('CATCH ERROR UPLOAD PRODUCTS')
        console.log(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}, ['vendor'])



