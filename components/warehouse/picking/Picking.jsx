'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useState } from 'react';
import LocationDetails from '@/components/warehouse/picking/Locations';

export default function Picking({ order }) {
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxHeight = (windowHeight - 160) + 'px';

    console.log('order', order);
    return (
        <>
            <div className={styles.fullscreen} style={{ height: windowHeight, width: windowWidth }}>
                <div className={styles.container}>

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
                    <div className={styles.productList} style={{ 'maxHeight': maxHeight}}>
                        {order.items.map((item, index) => (
                            <div className={styles.productItem} key={index} >

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
                                {/* <div className={styles.locationDetails}>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>A</div>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>2</div>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>4</div>
                                    <div className={`${styles.locationItem} ${styles.width5rem}`}>A</div>
                                </div> */}
                                <LocationDetails location={item.warehouse} styles={styles} />
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
                            <img alt='barcode' id="BarcodeImage" src="data:image/png;base64,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" />
                            {/* <img
                                src={order.barcodeImage || '/placeholder-barcode.png'}
                                alt="Barcode"
                                className={styles.barcodeImage}
                            /> */}
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