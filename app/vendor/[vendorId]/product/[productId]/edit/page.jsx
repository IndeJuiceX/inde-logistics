import EditProduct from '@/components/vendor/product/EditProduct';
import { getProductById } from '@/services/data/product';
export default async function EditProductPage({ params }) {
  const vendorId = params.vendorId;
  const productId = params.productId;

  let result = null;
  const response = await getProductById(vendorId, productId, ['warehouse']);
  if (response.success) {
    result = response.data;
  }
  else {
    console.log(response.error);
  }


  return (
    <EditProduct vendorId={vendorId} productData={result} isVendorDashboard={true} />
  );
}