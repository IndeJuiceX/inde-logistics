import AllProducts from '@/components/vendor/product/AllProducts';
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';
import { getAllVendorProducts } from '@/services/data/product';

export default async function AllProductsPage({ params }) {
  const vendorId = params.vendorId;
  /* this all product search it's working fine just comment it out for now
  const result = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  let totalProductsData = [];
  if (!result.success) {
    console.log('Failed to fetch products', result.error);

  }
  if (result.success) {
    totalProductsData = result.data;
  } */

  
    //  v2
    let totalProductsData = [];
    // const pageSize = 25;
    // getAllVendorProducts
    const response = await getAllVendorProducts(vendorId, 25);
    if (response.success) {
      totalProductsData = response.data;
    } else {
      console.error('Failed to fetch products:', response.error);
    }
  return (

    <AllProducts vendorId={vendorId} totalProductsData={totalProductsData} />
  );
}
