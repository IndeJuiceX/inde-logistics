import Orders from '@/components/vendor/order/Orders';

export default function OrdersPage({ params }) {
  const vendorId = params.vendorId;

  return (
    <Orders vendorId={vendorId} />
  );
}
