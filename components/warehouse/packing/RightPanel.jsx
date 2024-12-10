'use client';

import ParcelOptions from "@/components/warehouse/packing/ParcelOptions";
import { usePackingAppContext } from "@/contexts/PackingAppContext";
import { useGlobalContext } from "@/contexts/GlobalStateContext";

export default function RightPanel() {
    const packingContext = usePackingAppContext();
    const globalContext = useGlobalContext();
    return (
        <div className="col-span-1 overflow-y-auto">
            <ParcelOptions packingContext={packingContext} globalContext={globalContext} />
        </div>
    );
}