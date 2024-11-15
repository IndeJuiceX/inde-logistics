import Picking from "@/components/warehouse/picking/Picking";
import NewOrders from "./NewOrders";



export default function PickingApp({ unPickedResult, testing }) {
    return (
        <>
            {Array.isArray(unPickedResult.data) && unPickedResult.data.length === 0 && (
                <div>No orders found</div>
            )}
            {unPickedResult.data && !Array.isArray(unPickedResult.data) && (
                <Picking order={unPickedResult.data} />
                // <NewOrders testing={testing} />
            )}
        </>
    )
}