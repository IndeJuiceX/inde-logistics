'use client';
import React from "react";
import PackingHeader from "@/components/warehouse/packing/PackingHeader";
import PackingItems from "@/components/warehouse/packing/PackingItems";
import ParcelOptions from "@/components/warehouse/packing/ParcelOptions";
import { PackingAppProvider } from "@/contexts/PackingAppContext";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";
import PackingFooter from "@/components/warehouse/packing/PackingFooter";
import ErrorModal from "@/components/warehouse/errorModal/ErrorModal";
import PageSpinner from "@/components/loader/PageSpinner";
import PackingNoOrders from "@/components/warehouse/packing/PackingNoOrders";

export default function PackingApp({ orderData }) {
    return (
        <>
            {Array.isArray(orderData?.data) && orderData.data.length === 0 && (
                <PackingNoOrders />
            )}
            {orderData?.data && !Array.isArray(orderData.data) && (
                <div className="h-screen flex flex-col">
                    <GlobalStateProvider>
                        <ErrorModal />
                        <PageSpinner />
                        <PackingAppProvider orderData={orderData.data}>
                            <PackingHeader />
                            <div className="flex-1 overflow-hidden grid grid-cols-3">
                                <div className="col-span-2 overflow-y-auto">
                                    <PackingItems />
                                </div>
                                <div className="col-span-1 overflow-y-auto">
                                    <ParcelOptions />
                                </div>
                            </div>
                            <PackingFooter />
                        </PackingAppProvider>
                    </GlobalStateProvider>
                </div>
            )}
        </>
    );
}
