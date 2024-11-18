import React from "react";
import styles from '@/styles/warehouse/packing/PackingApp.module.scss';

export default function PackingApp() {
    return (
        <div className={styles.layout}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.orderCount}>x4</div>
                <div className={styles.customerInfo}>
                    <div>Neil Gardner</div>
                    <span>CUSTOMER</span>
                </div>
                <div className={styles.orderDetails}>
                    <span>INVITEXZZ</span>
                    <span>48H DELIVERY</span>
                    <span>#FT ORDER</span>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Product List */}
                <div className={styles.products}>
                    {/* Product Item */}
                    <div className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            {/*  eslint-disable-next-line */}
                            <img src="https://cdn.indejuice.com/images/GvS.jpg" alt="Cool Crush" />
                            <div className={styles.quantity}>x1</div>
                        </div>
                        <div className={styles.productDetails}>
                            <h3>Cool Crush</h3>
                            <p>10ml | 3mg | 70VG/30PG</p>
                        </div>
                    </div>

                    <div className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            {/*  eslint-disable-next-line */}
                            <img src="https://cdn.indejuice.com/images/GvS.jpg" alt="Avalanche" />
                            <div className={styles.quantity}>x1</div>
                        </div>
                        <div className={styles.productDetails}>
                            <h3>Avalanche</h3>
                            <p>10ml | 3mg | 70VG/30PG</p>
                        </div>
                    </div>

                    <div className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            {/*  eslint-disable-next-line */}
                            <img src="https://cdn.indejuice.com/images/GvS.jpg" alt="Berry Blast" />
                            <div className={styles.quantity}>x1</div>
                        </div>
                        <div className={styles.productDetails}>
                            <h3>Berry Blast</h3>
                            <p>10ml | 3mg | 70VG/30PG</p>
                        </div>
                    </div>
                </div>

                {/* Parcel Options */}
                <div className={styles.parcelOptions}>
                    <div className={`${styles.parcel} ${styles.small}`}>
                        {/*  eslint-disable-next-line */}
                        <img
                            src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
                            alt="Small Parcel"
                        />
                        SMALL PARCEL
                    </div>
                    <div className={`${styles.parcel} ${styles.large}`}>
                        {/*  eslint-disable-next-line */}
                        <img
                            src="https://dev.indejuice.com/img/wh/parcel_large.png"
                            alt="Large Parcel"
                        />
                        LARGE PARCEL
                    </div>
                    <div className={`${styles.parcel} ${styles.attention}`}>
                        {/*  eslint-disable-next-line */}
                        <img src="https://dev.indejuice.com/img/wh/warning.png" alt="error" />
                        <div className={``}>
                            REQUIRES ATTENTION
                        </div>
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
