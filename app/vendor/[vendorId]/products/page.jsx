import ProductDashboard from "@/components/vendor/product/ProductDashboard";
import { queryItemCount } from '@/services/external/dynamo/wrapper';



export default async function VendorProductsPage({ params }) {
  const vendorId = params.vendorId;
  const result = await queryItemCount(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  let totalProducts = 0;
  if (result.success) {
    totalProducts = result.count;
  }
  if (!result.success) {
    console.log('Failed to fetch product count', result.error);
  }


  return (
    <ProductDashboard vendorId={vendorId} totalProductsCount={totalProducts} />
  );
}
