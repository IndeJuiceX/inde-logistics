'use server';

import Picking from "@/components/warehouse/picking/Picking";
import PickingApp from "@/components/warehouse/picking/PickingApp";
import { getNextUnPickedOrderShipment } from '@/services/data/order-shipment';
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';

export default async function PickingPage() {
    
    const unPickedResult = await getNextUnPickedOrderShipment();

    if (!unPickedResult.success) {
        console.log('Failed to get unpicked order items', unPickedResult.error);
    }

    


    return (
        <>
            {/* {Array.isArray(unPickedResult.data) && unPickedResult.data.length === 0 && (
                <div>No orders found</div>
            )}
            {unPickedResult.data && !Array.isArray(unPickedResult.data) && (
                <Picking order={unPickedResult.data} />
            )} */}

            <PickingApp unPickedResult={unPickedResult} />
        </>

    )
}
