import { PickingAppProvider } from "@/contexts/PickingAppContext";
import InitiateBarcodeScanner from "../barcode/InitiateBarcodeScanner";



export default function PickingLayout({ children }) {
    return (
        <PickingAppProvider >
            <InitiateBarcodeScanner />
            {children}

        </PickingAppProvider>
    );
}