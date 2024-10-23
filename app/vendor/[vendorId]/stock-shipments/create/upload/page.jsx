import UploadStockShipment from "@/components/vendor/stock-shipment/create/UploadStockShipment";

export default function StockShipmentUploadPage({ params }) {
    const vendorId = params.vendorId;

    return (
      <UploadStockShipment vendorId={vendorId} />   
    );
}
