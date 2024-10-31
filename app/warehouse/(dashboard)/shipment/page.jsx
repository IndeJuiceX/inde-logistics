import StockDashboard from "@/components/warehouse/dashboard/StockDashboard";
import TapMenu from "@/components/warehouse/dashboard/TapMenu";
import Shipment from "@/components/warehouse/shipment/Shipment";

// async function getShipments() {
//     const response = await fetch('http://localhost:3002/api/v1/admin/vendors');
//     const shipments = await response.json();
//     console.log('ship', shipments);

//     return shipments;
// }


export default async function ShipmentPage() {
    // const shipments = await getShipments();
    return (
       <Shipment  />
    )
}