import AdminProducts from '@/components/admin/vendor/products/AdminProducts';

export default function AdminProductsPage({ params }) {
  const vendorId = params.vendorId; 



  return (
    <AdminProducts />
  );
}