'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationDetails from '@/components/warehouse/picking/Locations';
import ItemBarcode from '@/components/warehouse/barcode/ItemBarcode';
import { usePickingAppContext } from '@/contexts/PickingAppContext';
import { extractNameFromEmail } from '@/services/utils/index';
import { FaCheckCircle } from 'react-icons/fa';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import { updateOrderShipmentError, updateOrderShipmentStatus } from '@/services/data/order-shipment';

export default function Picking({ order, order_id }) {
    // console.log('test order ', order);
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();
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
    };

    const handleForceTick = () => {

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
        

        if (pickedItems === totalItems) {
            const vendor_id = order.vendor_id;
            const vendor_order_id = order.vendor_order_id;

            if (!vendor_id || !vendor_order_id) {
                setError(true);
                setErrorMessage('Something went wrong, Please reload the page');
                setIsErrorReload(true);
            }

            const data = await updateOrderShipmentStatus(vendor_id, vendor_order_id, 'picked');
            console.log('data', data);

            if (data.success) {
                window.location.reload();
            }
            else {
                setError(true);
                setErrorMessage(data.error);
                setIsErrorReload(true);
            }
        };

    }

    const handleErrorQueue = async () => {
        const errorItem = order.items[currentIndex];
        const vendor_id = order.vendor_id;
        const vendor_order_id = order.vendor_order_id;
        const error_reason = {
            reason: 'Missing Item',
            details: { vendor_sku: errorItem.vendor_sku, name: errorItem.name }
        }
        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!vendor_id || !vendor_order_id) {
            // return NextResponse.json({ error: 'vendor_id, vendor_order_id, and item are required' }, { status: 400 });
            setError(true);
            setErrorMessage('Something went wrong, Please reload the page');
            setIsErrorReload(true);
        }

        // Prepare the arguments array
        const args = [vendor_id, vendor_order_id];
        if (error_reason && error_reason != '' && error_reason !== undefined) {
            args.push(error_reason);
        }
        const data = await updateOrderShipmentError(...args);
        console.log('data', data);
        if (data.success) {
            window.location.reload();
        }
        else {
            setError(true);
            setErrorMessage(data.error);
            setIsErrorReload(true);
        }

    }


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
                                <p className={styles.value}>{order.vendor_order_id || '#ABCD'}</p>
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
                                    {/* <p className={styles.containerInfo}>Container 1</p> */}
                                </div>
                                <div className={styles.warningButtonContainer}>
                                    <button onClick={handleErrorQueue} className={styles.warningButton}>!</button>
                                </div>
                                {selectedItem.length === order.items.length && (
                                    <button
                                        onClick={handlePicked}
                                        className={styles.completeButton}
                                    >
                                        <FaCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                        Items Ready
                                    </button>
                                )}

                            </div>
                            <ItemBarcode styles={styles} onBarcodeScanned={moveToNextItem} currentItem={order.items[currentIndex]} order={order} />
                        </div>

                    </div>
                </div>
            }
        </>
    );
}
