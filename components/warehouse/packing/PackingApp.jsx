import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';
import PackingHeader from "@/components/warehouse/packing/PackingHeader";

export default function PackingApp() {
    return (
        <div className={styles.layout}>
            {/* Header */}
            <PackingHeader />

            {/* Main Section */}
            <div className={styles.main}>
                {/* Product List */}
                <div className={styles.content}>
                    <div className={styles.products}>
                        {/* Product Item */}
                        {["Cool Crush", "Avalanche", "Berry Blast"].map((product, index) => (
                            <div key={index} className={styles.productItem}>
                                <div className={styles.imageContainer}>
                                    {/* eslint-disable-next-line */}
                                    <img
                                        src="https://cdn.indejuice.com/images/GvS.jpg"
                                        alt={product}
                                    />
                                    <div className={styles.quantity}>x1</div>
                                </div>
                                <div className={styles.productDetails}>
                                    <h3>{product}</h3>
                                    <p>10ml | 3mg | 70VG/30PG</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
