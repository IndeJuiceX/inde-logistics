'use client';
import React from "react";
import PackingHeader from "@/components/warehouse/packing/PackingHeader";
import PackingItems from "@/components/warehouse/packing/PackingItems";
import RightPanel from "@/components/warehouse/packing/RightPanel";
import { PackingAppProvider } from "@/contexts/PackingAppContext";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";
import PackingFooter from "@/components/warehouse/packing/PackingFooter";
import ErrorModal from "@/components/warehouse/errorModal/ErrorModal";
import PackingNoOrders from "@/components/warehouse/packing/PackingNoOrders";

export default function PackingApp({ orderData, errorQueue }) {
    
    return (
        <>
            {Array.isArray(orderData) && orderData.length === 0 && (
                <PackingNoOrders />
            )}
            {((!errorQueue && orderData && !Array.isArray(orderData)) || (errorQueue && orderData && Array.isArray(orderData))) && (
                <div className="h-screen flex flex-col">
                    <GlobalStateProvider>
                        <ErrorModal />
                        <PackingAppProvider orderData={orderData} errorQueue={errorQueue}>
                            <PackingHeader />
                            <div className="flex-1 overflow-hidden grid grid-cols-3">
                                <div className="col-span-2 overflow-y-auto">
                                    <PackingItems />
                                </div>
                                <RightPanel />
                            </div>
                            <PackingFooter />
                        </PackingAppProvider>
                    </GlobalStateProvider>
                </div>
            )}
        </>
    );
}
