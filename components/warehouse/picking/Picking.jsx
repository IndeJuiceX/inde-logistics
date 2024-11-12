'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useRef, useState } from 'react';
import LocationDetails from '@/components/warehouse/picking/Locations';
import InitiateBarcodeScanner from '@/components/warehouse/barcode/InitiateBarcodeScanner';

export default function Picking({ order }) {
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0); // Track the current item index
    const itemRefs = useRef([]); // Array of refs for each item

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

    const handleNextClick = () => {
        console.log('next clicked');

        if (currentIndex < order.items.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <>
            <InitiateBarcodeScanner  />
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
                    <div className={styles.productList} style={{ maxHeight }}>
                        {order.items.map((item, index) => (
                            <div
                                className={`${styles.productItem} ${index < currentIndex ? styles.disabledItem : ''
                                    }`}
                                key={index}
                                ref={(el) => (itemRefs.current[index] = el)} // Assign refs to each item
                            >
                                <div className={styles.productImageContainer}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.productImage || 'https://cdn.indejuice.com/images/4j6.jpg'}
                                        alt="Product"
                                        className={styles.productImage}
                                    />
                                    <div className={styles.productQuantity}>
                                        x{item.productQuantity || 1}
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

                            <p onClick={handleNextClick} className={styles.barcodeText}>{order.barcodeText || '1234567890'}</p>
                        </div>
                        {/* Warning Button */}
                        <div className={styles.warningButtonContainer}>
                            <button className={styles.warningButton}>!</button>
                        </div>
                    </div>

                    {/* Next Button */}
                    {/* <div className={styles.nextButtonContainer}>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextClick}
                            disabled={currentIndex >= order.items.length - 1}
                        >
                            Next
                        </button>
                    </div> */}
                </div>
            </div>
        </>
    );
}
