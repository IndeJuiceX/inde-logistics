import ProductDashboard from "@/components/vendor/product/ProductDashboard";

// async function productCount(vendorId) {
//   try {
//     // const response = await fetch(`/api/v1/admin/vendor/products/count?vendorId=${vendorId}`);
//     const baseUrl = process.env.NEXTAUTH_URL || ''; // Ensure the base URL is set
//     const url = `${baseUrl}/api/v1/admin/vendor/products/count?vendorId=${vendorId}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (response.status !== 200) {
//       console.error('Something went wrong fetching total products count:', data);
//       return 0;
//     }
//     return data.count;
//   } catch (error) {
//     console.error('Error fetching total products count:', error);
//   }

// }

export default async function VendorProductsPage({ params }) {
  // console.log('vendorID', params.vendorId);
  // const totalProductCount = await productCount(params.vendorId);
  const vendorId = params.vendorId;
  return (
    <ProductDashboard vendorId={vendorId} />
  );
}
