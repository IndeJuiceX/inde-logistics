import StockShipmentDetails from "@/components/vendor/stock-shipment/StockShipmentDetails";


export default function StockShipmentDetailsPage({ params }) {
  const vendorId = params.vendorId;
  const stockShipmentId = params.stockShipmentId;

  return (
    <StockShipmentDetails vendorId={vendorId} stockShipmentId={stockShipmentId} />
  );
}