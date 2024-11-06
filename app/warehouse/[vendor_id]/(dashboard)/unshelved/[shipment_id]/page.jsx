
import UnShelvedItems from "@/components/warehouse/unshelved/UnShelvedItems.jsx";
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import { getVendorById } from "@/services/data/vendor";
import { getUnshelvedItemsFromStockShipment } from "@/services/data/stock-shipment-item";

export default async function unShelvedShipmentPage({ params }) {
    const { vendor_id, shipment_id } = params;


    let shipmentDetails = []
    let error = null;
    const unshelvedResult = await getUnshelvedItemsFromStockShipment(vendor_id, shipment_id);

    
    if (unshelvedResult.success) {
        shipmentDetails = unshelvedResult.data
    }
    if (!unshelvedResult.success) {
        error = unshelvedResult.error;
    }
    let vendor = await getVendorById(vendor_id);
    if (!vendor.success) {
        vendor = []
    }
    else {
        vendor = vendor.data
    }
    // console.log('vendor', shipmentDetails);
    
    return (
        <UnShelvedItems vendor={vendor} shipmentDetails={shipmentDetails} error={error} />
    )
}