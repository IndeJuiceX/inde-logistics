'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationDetails from '@/components/warehouse/picking/Locations';
import InitiateBarcodeScanner from '@/components/warehouse/barcode/InitiateBarcodeScanner';
import ItemBarcode from '@/components/warehouse/barcode/ItemBarcode';
import { usePickingAppContext } from '@/contexts/PickingAppContext';

export default function Picking({ order, order_id }) {
    const { isBarcodeInitiated, setBarcodeInitiated } = usePickingAppContext();
    const router = useRouter();
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0); // Track the current item index
    const itemRefs = useRef([]); // Array of refs for each item
    // const [isInitiated, setIsInitiated] = useState(false);

    console.log('order', order);


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

    const moveToNextItem = (barcodeValue) => {
        const currentItem = order.items[currentIndex];
        if (barcodeValue === currentItem.barcode) {
            if (currentIndex < order.items.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            else {
                order_id++;
                router.push(`/warehouse/picking/${order_id}`);
            }
        }
    };

    return (
        <>
            {/* <InitiateBarcodeScanner setIsInitiated={setBarcodeInitiated} /> */}
            {isBarcodeInitiated &&
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
                                    <div className={styles.productInfo}>
                                        <p className={styles.productName}>{item.name}</p>
                                        <p className={styles.productWarning}>{item.brand_name}</p>
                                        <div className={styles.productAttributes}>
                                            <p className={styles.attributes}>
                                                {Object.values(item.attributes || {})
                                                    .filter(value => value && value.length > 0)
                                                    .map(value => Array.isArray(value) ? value.join(', ') : value)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <LocationDetails location={item.warehouse} styles={styles} />
                                </div>
                            ))}
                        </div>

                        {/* Picker Info & Barcode */}
                        <div className={styles.footer}>
                            <div className={styles.pickerInfo}>
                                <div>
                                    <p className={styles.pickerName}>{order.pickerName || 'Ali B.'}</p>
                                    <p className={styles.containerInfo}>Container {order.container || '1'}</p>
                                </div>
                                <div className={styles.warningButtonContainer}>
                                    <button className={styles.warningButton}>!</button>
                                </div>
                            </div>
                            <ItemBarcode styles={styles} onBarcodeScanned={moveToNextItem} currentItem={order.items[currentIndex]} />
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
            }
        </>
    );
}
