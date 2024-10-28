import EditStockShipment from "@/components/vendor/stock-shipment/edit/EditStockShipment";

export default function EditStockShipmentPage({ params}) {
  const vendorId = params.vendorId;
  const stockShipmentId = params.stockShipmentId;

  return (
    <EditStockShipment vendorId={vendorId} stockShipmentId={stockShipmentId} />
  );
}