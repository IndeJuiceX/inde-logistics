import ShipmentItems from "@/components/warehouse/shipments/shipment/ShipmentItems";
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import { getVendorById } from "@/services/data/vendor";



export default async function ShipmentPage({ params }) {
    const { vendor_id, shipment_id } = params;

    const getShipmentDetails = await getStockShipmentDetails(vendor_id, shipment_id);
    let shipmentDetails = []
    if (getShipmentDetails.success) {
        shipmentDetails = getShipmentDetails.data
    }
    let vendor = await getVendorById(vendor_id);
    if (!vendor.success) {
        vendor = []
    }
    else {
        vendor = vendor.data
    }

    return (
        <ShipmentItems shipmentDetailsData={shipmentDetails} vendor={vendor} />
    )
}