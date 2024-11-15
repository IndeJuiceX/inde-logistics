'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationDetails from '@/components/warehouse/picking/Locations';
import InitiateBarcodeScanner from '@/components/warehouse/barcode/InitiateBarcodeScanner';
import ItemBarcode from '@/components/warehouse/barcode/ItemBarcode';
import { usePickingAppContext } from '@/contexts/PickingAppContext';
import { extractNameFromEmail } from '@/services/utils/index';


export default function Picking({ order, order_id }) {
    // console.log('test order ', order);

    const { isBarcodeInitiated, setBarcodeInitiated } = usePickingAppContext();
    const router = useRouter();
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0); // Track the current item index
    const itemRefs = useRef([]); // Array of refs for each item
    const [selectedItem, setSelectedItem] = useState([]);

  

    // console.log('order', order);


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
        if (currentItem.barcode) {
            console.log('currentItem.barcode', currentItem.barcode);
            return;

        }


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

    const handleForceTick = () => {
        console.log('force tick');
        console.log('currentIndex', currentIndex);
        console.log('order.items.length', order.items.length);
        console.log('condition', order.items.length - 1);

        setSelectedItem(prevSelectedItem => {
            const newSelectedItem = [...prevSelectedItem];
            newSelectedItem[currentIndex] = currentIndex;
            return newSelectedItem;
        });


        if (currentIndex < order.items.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    }
    const handlePicked = async () => {
        const totalItems = order.items.length; //index starts from 0
        const pickedItems = selectedItem.filter(item => item !== undefined).length;
        console.log('pickedItems', pickedItems);
        console.log('totalItems', totalItems);

        if (pickedItems === totalItems) {
            const payload = {
                vendor_id: order.vendor_id,
                vendor_order_id: order.vendor_order_id,
            }
            // app/api/v1/admin/order-shipments/mark-picked/route.js
            const response = await fetch('/api/v1/admin/order-shipments/mark-picked', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                console.log('Error in marking order as picked');
            }
            const data = await response.json();
            console.log('data', data);
            if (data.success) {
                // router.push('/warehouse/picking');
                window.location.reload();
            }

        };

    }

    const handleErrorQueue = async () => {
        console.log('handleErrorQueue');

        const errorItem = order.items[currentIndex];
        console.log('order current', errorItem);

        const payload = {
            vendor_id: order.vendor_id,
            vendor_order_id: order.vendor_order_id,
            error_reason: {
                reason: 'Missing Item',
                details: { vendor_sku: errorItem.vendor_sku, name: errorItem.name }
            }
        }
        // app/api/v1/admin/order-shipments/flag-error/route.js
        const response = await fetch('/api/v1/admin/order-shipments/flag-error', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.log('Error in marking order as error');
        }
        const data = await response.json();
        console.log('data', data.success);
        if (data.success) {
            window.location.reload();

        }
    }
    useEffect(() => {
        console.log('selectedItem', selectedItem);

    }, [selectedItem]);

    const totalQuantity = order?.items?.length ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    return (
        <>
           
            {/* <InitiateBarcodeScanner setIsInitiated={setBarcodeInitiated} /> */}
            {isBarcodeInitiated &&
                <div className={styles.fullscreen} style={{ height: windowHeight, width: windowWidth }}>
                    <div className={styles.container}>

                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <div className={styles.orderCode}>X{totalQuantity || '0'}</div>
                            <div className={styles.infoSection}>
                                <p className={styles.label}>Customer</p>
                                <p className={styles.value}>{order.buyer.name || 'G M'}</p>
                            </div>
                            {/* <div className={styles.infoSection}>
                                <p className={styles.label}>Vendor</p>
                                <p className={styles.value}>{order.vendor_id || 'INVITERI'}</p>
                            </div> */}
                            <div className={styles.infoSection}>
                                <p className={styles.label}>Delivery</p>
                                <p className={styles.value}>24</p>
                            </div>
                            <div className={styles.infoSection}>
                                <p className={styles.label}>Order</p>
                                <p className={styles.value}>{order.order_id || '#ABCD'}</p>
                            </div>
                        </div>

                        {/* Product & Location Section */}
                        <div className={styles.productList} style={{ maxHeight }}>
                            {order.items.map((item, index) => (
                                // ${index < currentIndex ? styles.disabledItem : ''}
                                <div
                                    className={`${styles.productItem} ${selectedItem[index] === index ? styles.disabledItem : ''
                                        }`}
                                    key={index}
                                    data-index={index}
                                    data-current={selectedItem[index]}
                                    ref={(el) => (itemRefs.current[index] = el)} // Assign refs to each item
                                >
                                    <div className={styles.productImageContainer}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image || 'https://cdn.indejuice.com/images/4j6.jpg'}
                                            alt="Product"
                                            className={styles.productImage}
                                        />
                                        <div className={styles.productQuantity}>
                                            x{item.quantity || 1}
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
                                        <button onClick={handleForceTick}> force tick </button>
                                    </div>
                                    <LocationDetails location={item.warehouse} styles={styles} />
                                </div>
                            ))}
                        </div>

                        {/* Picker Info & Barcode */}
                        <div className={styles.footer}>
                            <div className={styles.pickerInfo}>
                                <div>
                                    <p className={styles.pickerName}>{extractNameFromEmail(order.picker) || 'Ali B.'}</p>
                                    <p className={styles.containerInfo}>Container 1</p>
                                </div>
                                <div className={styles.warningButtonContainer}>
                                    <button onClick={handleErrorQueue} className={styles.warningButton}>!</button>
                                </div>
                                <button onClick={handlePicked}>Item Completed</button>
                            </div>



                            <ItemBarcode styles={styles} onBarcodeScanned={moveToNextItem} currentItem={order.items[currentIndex]} />
                        </div>

                    </div>
                </div>
            }
        </>
    );
}
