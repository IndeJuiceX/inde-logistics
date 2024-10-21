import AllProducts from '@/components/vendor/product/AllProducts';

export default function AllProductsPage({ params }) {
  const vendorId = params.vendorId;

  return (
    
    <AllProducts vendorId={vendorId}/>
  );
}
