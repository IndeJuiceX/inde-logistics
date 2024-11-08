import AdminProducts from '@/components/admin/vendor/products/AdminProducts';
import { queryItemCount } from '@/lib/dynamodb';

export default async function AdminProductsPage({ params }) {
  const vendorId = params.vendorId; 
  
  let totalProductCount = 0;

  const result = await queryItemCount(`VENDORPRODUCT#${vendorId}`, 'PRODUCT#');
  if (!result.success) {
    console.log('Failed to fetch product count', result.error);
  }
  if (result.success) {
    totalProductCount = result.count;
  }

  return (
    <AdminProducts totalProductCount={totalProductCount} />
  );
}