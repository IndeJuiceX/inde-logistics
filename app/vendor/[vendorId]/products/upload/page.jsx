import UploadProduct from '@/components/vendor/product/UploadProduct';

export default function VendorUploadPage({ params }) {
  const vendorId = params.vendorId;

  return (
    <UploadProduct vendorId={vendorId} />
  );
}
