import { NextResponse } from 'next/server';
import { queryItems, batchWriteItems } from '@/lib/dynamodb';  // Import your DynamoDB helper functions
import { authenticateAndAuthorize } from '@/services/utils/apiMiddleware';

export async function DELETE(request) {
  try {
    // Extract vendorId from query parameters

    const { authorized, user, status } = await authenticateAndAuthorize(request);

    // If not authorized, return an appropriate response
    if (!authorized) {
      return NextResponse.json({ error: 'Access denied' }, { status });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    console.log('DELETE REQUEST RECEIVED FOR PRODUCTS OF ' + vendorId)
    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId parameter' }, { status: 400 });
    }

    // Query all products for the given vendorId using GSI
    const result = await queryItems(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    const products = result.data;
    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found for the vendor' }, { status: 200 });
    }

    // Extract the PK and SK for each product to delete them
    const itemsToDelete = products.map(product => ({
      pk: product.pk,
      sk: product.sk,
    }));

    console.log('ITEMS TO DELETE SIZE IS--' + itemsToDelete.length)
    console.log('ITEM TO DELETE IS')
    // Batch delete the products
    const deleteResponse = await batchWriteItems(itemsToDelete, 'Delete');
    if (!deleteResponse.success) {
      return NextResponse.json({ error: 'Failed to delete products', details: deleteResponse.error }, { status: 500 });
    }

    return NextResponse.json({ message: `${products.length} products deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error in /delete-products endpoint:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
