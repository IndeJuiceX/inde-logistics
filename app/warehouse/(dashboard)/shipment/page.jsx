import StockDashboard from "@/components/warehouse/dashboard/StockDashboard";
import TapMenu from "@/components/warehouse/dashboard/TapMenu";
import Shipment from "@/components/warehouse/shipment/Shipment";
import { getAllVendors } from "@/services/data/vendor";


async function getVendors() {
    const vendors = await getAllVendors();
    if (!vendors.success) {
        return [];
    }
    return vendors.data;
}


export default async function ShipmentPage() {
    const vendors = await getVendors();
    return (
        <Shipment vendors={vendors} />
    )
}