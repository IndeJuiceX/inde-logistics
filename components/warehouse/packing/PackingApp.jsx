import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';
import PackingHeader from "@/components/warehouse/packing/PackingHeader";
import PackingItems from "@/components/warehouse/packing/PackingItems";
import ParcelOptions from "@/components/warehouse/packing/ParcelOptions";
import ParcelDetails from "@/components/warehouse/packing/ParcelDetails";
import { PackingAppProvider } from "@/contexts/PackingAppContext";
import PackingFooter from "@/components/warehouse/packing/PackingFooter";

export default function PackingApp({ orderData }) {
    return (
        <div className={styles.layout}>
            <PackingAppProvider orderData={orderData}>

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
        </div>
    );
}
