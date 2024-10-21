import EditProduct from '@/components/vendor/product/EditProduct';

export default function EditProductPage({ params }) {
  const vendorId = params.vendorId;
  const productId = params.productId;

  console.log('vendorId', vendorId);
  console.log('productId', productId);


  return (
    <EditProduct vendorId={vendorId} productId={productId} />
  );
}