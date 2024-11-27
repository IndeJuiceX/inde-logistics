import ProductDetails from '@/components/admin/vendor/products/ProductDetails';
import { getProductById } from '@/services/data/product';


export default async function ProductDetailsPage({ params }) {
  const { vendorId, productId } = params;
  let result = null;
  const productData = await getProductById(vendorId, productId);

  if (productData.success) {
    result = productData.data;
  } else {
    console.error('Error fetching product data:', productData.error);
  }


  return (
    <ProductDetails productData={result} vendorId={vendorId} productId={productId} />
  );
}