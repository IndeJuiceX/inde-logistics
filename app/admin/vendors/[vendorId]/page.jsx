
import { getVendorById } from '@/services/data/vendor';
import VendorDetails from '@/components/admin/vendor/VendorDetails';
export default async function VendorDetailsPage({ params }) {

  let result = [];

  const response = await getVendorById(params.vendorId);

  if (response.success) {
    result = response.data;
  } else {
    console.error('Error fetching vendor:', response.error);
  }



  return (
    <VendorDetails vendorDataFromSever={result} />
  );
}