'use client';

import CreateStockShipment from '@/components/vendor/stock-shipment/create/CreateStockShipment';
import { useRouter, useParams } from 'next/navigation';

export default function CreateStockShipmentOptionsPage({ params }) {
  const vendorId = params.vendorId;

  return (
    <CreateStockShipment vendorId={vendorId} />
  );
}