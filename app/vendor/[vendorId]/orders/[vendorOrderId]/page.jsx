import OrderView from "@/components/vendor/order/OrderView";


export default function OrderDetailsPage({ params }) {
  const vendorId = params.vendorId;
  const vendorOrderId = params.vendorOrderId;

  return (
    <OrderView vendorId={vendorId} vendorOrderId={vendorOrderId} />
  );
}