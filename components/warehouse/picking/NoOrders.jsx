import { usePickingAppContext } from "@/contexts/PickingAppContext";

export default function NoOrders() {
    const { handleSignOut } = usePickingAppContext();
    return (
        <div>
            <h1>No Orders</h1>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    )
}