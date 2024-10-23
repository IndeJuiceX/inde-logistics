import ManualStockShipment from "@/components/vendor/stock-shipment/create/ManualStockShipment";


export default function CreateStockShipmentPageManual({ params }) {
  const vendorId = params.vendorId;

  return (
    <ManualStockShipment vendorId={vendorId} />
  );
}