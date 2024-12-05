'use server'

import OrderView from "@/components/vendor/order/OrderView";
import { getMultipleOrdersByIds } from '@/services/data/order';


export default async function OrderDetailsPage({ params }) {
  const vendorId = params.vendorId;
  const vendorOrderId = params.vendorOrderId;
  let result = [];
  const orderData = await getMultipleOrdersByIds(vendorId, [vendorOrderId]);

  if (orderData.success) {
    result = orderData.data;
  }


  return (
    <OrderView vendorId={vendorId} vendorOrderId={vendorOrderId} orderData={result} />
  );
}