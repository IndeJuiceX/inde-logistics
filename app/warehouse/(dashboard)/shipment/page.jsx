import StockDashboard from "@/components/warehouse/dashboard/StockDashboard";
import TapMenu from "@/components/warehouse/dashboard/TapMenu";
import Shipment from "@/components/warehouse/shipment/Shipment";
import { customFetch } from "@/services/utils";

// async function getShipments() {
//     const response = await customFetch('api/v1/admin/vendors');
//     if (!response.ok) {
//         console.log('Failed to fetch shipments');
//         return [];
//     }
//     const shipments = await response.json();
//     return shipments;
// }


export default async function ShipmentPage() {
    // const shipments = await getShipments();
    return (
        <Shipment />
    )
}