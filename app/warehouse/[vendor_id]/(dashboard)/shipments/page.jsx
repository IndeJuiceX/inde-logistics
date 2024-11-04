import Shipments from "@/components/warehouse/shipments/Shipments";
import { getAllStockShipments } from "@/services/data/stock-shipment";
import { getAllVendors } from "@/services/data/vendor";


async function getVendors() {
    const vendors = await getAllVendors();
    if (!vendors.success) {
        return [];
    }
    return vendors.data;
}
async function getStockShipments(vendorId) {
    const stockShipments = await getAllStockShipments(vendorId);
    if (!stockShipments.success) {
        return [];
    }
    return stockShipments.data;
}

export default async function ShipmentPage({ params }) {
    const { vendor_id } = params;
    let stockShipments = [];

    const vendors = await getVendors();
    if (vendor_id !== 'all') {
        stockShipments = await getStockShipments(vendor_id);
    }


    return (
        <Shipments vendors={vendors} stockShipments={stockShipments} />
    )
}