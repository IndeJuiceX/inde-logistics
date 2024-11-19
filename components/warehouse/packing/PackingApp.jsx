import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';
import PackingHeader from "@/components/warehouse/packing/PackingHeader";
import PackingItems from "@/components/warehouse/packing/PackingItems";
import ParcelOptions from "@/components/warehouse/packing/ParcelOptions";
import ParcelDetails from "@/components/warehouse/packing/ParcelDetails";

export default function PackingApp() {
    return (
        <div className={styles.layout}>
            {/* Header */}
            <PackingHeader />

            {/* Main Section */}
            <div className={styles.main}>
                {/* Product List */}

                <PackingItems />

                {/* Parcel Options */}
                {/* <ParcelOptions /> */}
                <ParcelDetails />
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <div>Ali B.</div>
                <div>Container 1</div>
            </footer>
        </div>
    );
}
