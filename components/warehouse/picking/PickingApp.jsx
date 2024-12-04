'use client';

import Picking from "@/components/warehouse/picking/Picking";
import NoOrders from "@/components/warehouse/picking/NoOrders";
import { sortOrders } from "@/services/utils/customSorting";



export default function PickingApp({ unPickedResult }) {
    let order = null;

    if (unPickedResult?.data && !Array.isArray(unPickedResult.data)) {
        const newSortedOrder = sortOrders(unPickedResult.data.items);
        order = {
            ...unPickedResult.data,
            items: newSortedOrder
        };
    }


    return (
        <>
            {Array.isArray(unPickedResult?.data) && unPickedResult.data.length === 0 && (
               
                <NoOrders />

            )}
            {unPickedResult?.data && !Array.isArray(unPickedResult.data) && (
                <Picking order={order} />

            )}
        </>
    )
}