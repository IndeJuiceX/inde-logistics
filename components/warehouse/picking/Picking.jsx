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