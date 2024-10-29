'use client';

import CreateOrder from '@/components/vendor/order/CreateOrder';

export default function CreateOrderOptionsPage({ params }) {
  const vendorId = params.vendorId;
  return (
    <CreateOrder vendorId={vendorId} />
  );
}