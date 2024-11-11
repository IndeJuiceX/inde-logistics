'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useState } from 'react';

export default function Picking({ order }) {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxHeight = (windowHeight - 160) + 'px';

    console.log('order', order);
    return (
        <>
            <div className={styles.fullscreen} style={{ height: windowHeight, width: windowWidth }}>
                <div className={styles.container}>
                    {/* Main Container */}
                    {/* Header Section */}
                    <div className={styles.headerSection}>
                        <div className={styles.orderCode}>{order.orderCode || 'X1'}</div>
                        <div className={styles.infoSection}>
                            <p className={styles.label}>Customer</p>
                            <p className={styles.value}>{order.customerName || 'G M'}</p>
                        </div>
                        <div className={styles.infoSection}>
                            <p className={styles.label}>Referral</p>
                            <p className={styles.value}>{order.referralCode || 'INVITERI'}</p>
                        </div>
                        <div className={styles.infoSection}>
                            <p className={styles.label}>Delivery</p>
                            <p className={styles.value}>{order.deliveryTime || '48H'}</p>
                        </div>
                        <div className={styles.infoSection}>
                            <p className={styles.label}>Order</p>
                            <p className={styles.value}>{order.orderNumber || '#AOYL'}</p>
                        </div>


                    </div>
                    {/* Product & Location Section */}
                    <div className={styles.productList} style={{ 'maxHeight': maxHeight }}>
                        {order.items.map((item, index) => (
                            <div className={styles.productItem} key={index}>
                                {/* Product Image */}
                                <div className={styles.productImageContainer}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={order.productImage || 'https://cdn.indejuice.com/images/4j6.jpg'}
                                        alt="Product"
                                        className={styles.productImage}
                                    />
                                    <div className={styles.productQuantity}>
                                        x{order.productQuantity || 1}
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className={styles.locationDetails}>
                                    <div className={`${styles.locationItem} ${styles.width8rem}`}>A</div>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>2</div>
                                    <div className={`${styles.locationItem} ${styles.width8rem}`}>4</div>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>A</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Picker Info & Barcode */}
                    <div className={styles.pickerBarcodeSection}>
                        <div className={styles.pickerInfo}>
                            <p className={styles.pickerName}>{order.pickerName || 'Ali B.'}</p>
                            <p className={styles.containerInfo}>Container {order.container || '1'}</p>
                        </div>
                        <div className={styles.barcodeInfo}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={order.barcodeImage || '/placeholder-barcode.png'}
                                alt="Barcode"
                                className={styles.barcodeImage}
                            />
                            <p className={styles.barcodeText}>{order.barcodeText || '1234567890'}</p>
                        </div>
                        {/* Warning Button */}
                        <div className={styles.warningButtonContainer}>
                            <button className={styles.warningButton}>!</button>
                        </div>
                    </div>


                </div>
            </div>
        </>
    );
}