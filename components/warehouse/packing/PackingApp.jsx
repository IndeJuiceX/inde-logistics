'use client';
import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';
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
                <div className={styles.layout}>

                    <GlobalStateProvider>
                        <ErrorModal />
                        <PageSpinner />
                        <PackingAppProvider orderData={orderData.data}>


                            <PackingHeader />

                            {/* Main Section */}
                            <div className={styles.main}>
                                {/* Product List */}

                                <PackingItems />

                                {/* Parcel Options */}
                                <ParcelOptions />
                                {/* <ParcelDetails /> */}
                            </div>

                            <PackingFooter />

                        </PackingAppProvider>
                    </GlobalStateProvider>
                </div>
            )}
        </>
    );
}
