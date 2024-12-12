'use server';


import PickingApp from "@/components/warehouse/picking/PickingApp";
import { getNextUnPickedOrderShipmentNew } from '@/services/data/order-shipment';


export default async function PickingPage() {

    // const unPickedResult = await getNextUnPickedOrderShipment();
    const unPickedResult = await getNextUnPickedOrderShipmentNew();
    console.log('unPickedResult', unPickedResult);
    if (!unPickedResult.success) {
        console.log('Failed to get unpicked order items', unPickedResult.error);
    }




    return (
        <PickingApp unPickedResult={unPickedResult} />
    )
}
