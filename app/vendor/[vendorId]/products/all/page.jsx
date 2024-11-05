import AllProducts from '@/components/vendor/product/AllProducts';
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';

export default async function AllProductsPage({ params }) {
  const vendorId = params.vendorId;
  const result = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  let totalProductsData = [];
  if (!result.success) {
    console.log('Failed to fetch products', result.error);

  }
  if (result.success) {
    totalProductsData = result.data;
  }
  return (

    <AllProducts vendorId={vendorId} totalProductsData={totalProductsData} />
  );
}
