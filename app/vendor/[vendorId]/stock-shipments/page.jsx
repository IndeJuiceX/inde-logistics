import StockShipments from "@/components/vendor/stock-shipment/StockShipments";

export default function StockShipmentsPage({ params }) {
  const vendorId = params.vendorId;

  return (
    
    <StockShipments vendorId={vendorId} />
  );
}
