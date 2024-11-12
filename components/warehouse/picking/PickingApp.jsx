import { PickingAppProvider } from "@/contexts/PickingAppContext";
import InitiateBarcodeScanner from "../barcode/InitiateBarcodeScanner";



export default function PickingApp({ children }) {
    return (
        <PickingAppProvider >
             <InitiateBarcodeScanner />
            {children}

        </PickingAppProvider>
    );
}