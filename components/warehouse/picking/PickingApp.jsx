import { PickingAppProvider } from "@/contexts/PickingAppContext";


export default function PickingApp({ children }) {
    return (
        <PickingAppProvider>
            {children}
        </PickingAppProvider>
    );
}