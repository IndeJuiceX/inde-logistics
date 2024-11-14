import { usePickingAppContext } from "@/contexts/PickingAppContext";




export default function NewOrders() {
    const { handleSignOut } = usePickingAppContext();
    return (
        <div>
            <h1>New Orders</h1>

            <button onClick={handleSignOut}>Sign Out</button>

        </div>
    )
}