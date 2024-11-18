import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';
import PackingHeader from "@/components/warehouse/packing/PackingHeader";
import PackingItems from "@/components/warehouse/packing/PackingItems";

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
                <div className={styles.parcelOptions}>
                    <div className={`${styles.parcel} ${styles.small}`}>
                        {/* eslint-disable-next-line */}
                        <img
                            src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
                            alt="Small Parcel"
                        />
                        SMALL PARCEL
                    </div>
                    <div className={`${styles.parcel} ${styles.large}`}>
                        {/* eslint-disable-next-line */}
                        <img
                            src="https://dev.indejuice.com/img/wh/parcel_large.png"
                            alt="Large Parcel"
                        />
                        LARGE PARCEL
                    </div>
                    <div className={`${styles.parcel} ${styles.attention}`}>
                        {/* eslint-disable-next-line */}
                        <img
                            src="https://dev.indejuice.com/img/wh/warning.png"
                            alt="Attention"
                        />
                        <div>REQUIRES ATTENTION</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <div>Ali B.</div>
                <div>Container 1</div>
            </footer>
        </div>
    );
}
