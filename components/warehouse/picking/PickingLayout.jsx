import { PickingAppProvider } from "@/contexts/PickingAppContext";
import InitiateBarcodeScanner from "../barcode/InitiateBarcodeScanner";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";


export default function PickingLayout({ children }) {
    return (
        <GlobalStateProvider>
            <PickingAppProvider >
                <InitiateBarcodeScanner />
                {children}
            </PickingAppProvider>
        </GlobalStateProvider>
    );
}