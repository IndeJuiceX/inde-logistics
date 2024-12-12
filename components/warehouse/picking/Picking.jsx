'use client';

import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationDetails from '@/components/warehouse/picking/Locations';
import ItemBarcode from '@/components/warehouse/barcode/ItemBarcode';
import { usePickingAppContext } from '@/contexts/PickingAppContext';
import { extractNameFromEmail, getShippingDuration } from '@/services/utils/index';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import { updateOrderShipmentError, updateOrderShipment } from '@/services/data/order-shipment';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { doLogOut, getLoggedInUser } from '@/app/actions';

export default function Picking({ order }) {
    // console.log('test order ', order);
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();
    const { isBarcodeInitiated, setBarcodeInitiated } = usePickingAppContext();
    const router = useRouter();
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0); // Track the current item index
    const itemRefs = useRef([]); // Array of refs for each item
    const [selectedItem, setSelectedItem] = useState([]);
    const [pickedItems, setPickedItems] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);


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

        setPickedItems(prevPickedItems => [...prevPickedItems, currentItem]);

        setSelectedItem(prevSelectedItem => {
            const newSelectedItem = [...prevSelectedItem];
            newSelectedItem[currentIndex] = currentIndex;
            return newSelectedItem;
        });

        // If this was the last item, scroll to the confirmation screen
        if (currentIndex === order.items.length - 1) {
            // Add a small delay to ensure the confirmation screen is rendered
            setTimeout(() => {
                const confirmationScreen = document.querySelector('.bg-green-500');
                confirmationScreen?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            // Otherwise, scroll to the next item as before
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleForceTick = (index) => {
        const itemIndex = currentIndex;
        setSelectedItem(prevSelectedItem => {
            const newSelectedItem = [...prevSelectedItem];
            newSelectedItem[itemIndex] = itemIndex;
            return newSelectedItem;
        });

        setPickedItems(prevPickedItems => {
            // Check if item is already picked to avoid duplicates
            if (!prevPickedItems.includes(order.items[itemIndex])) {
                return [...prevPickedItems, order.items[itemIndex]];
            }
            return prevPickedItems;
        });

        if (itemIndex < order.items.length - 1) {
            const nextIndex = itemIndex + 1;
            setCurrentIndex(nextIndex);
            itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (itemIndex === order.items.length - 1) {
            setTimeout(() => {
                const confirmationScreen = document.querySelector('.bg-green-500');
                confirmationScreen?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
    const handlePicked = async (completeWithSignOut = false) => {

        const totalItems = order.items.length; //index starts from 0
        const pickedItemsCount = pickedItems.length;
        const user = await getLoggedInUser();


        if (pickedItemsCount === totalItems) {
            const vendor_id = order.vendor_id;
            const vendor_order_id = order.vendor_order_id;

            if (!vendor_id || !vendor_order_id) {
                setError(true);
                setErrorMessage('Something went wrong, Please reload the page');
                setIsErrorReload(true);
            }
            console.log('user', user);
            return;
            const data = await updateOrderShipment(vendor_id, vendor_order_id, 'picked', user.email);


            if (data.success) {
                if (completeWithSignOut) {
                    await doLogOut();
                }
                else {
                    window.location.href = '/warehouse/picking';
                }
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
        const error_reason = 'Missing Item';

        // Validate that vendor_id, stock_shipment_id, and  item are present
        if (!vendor_id || !vendor_order_id) {
            setError(true);
            setErrorMessage('Something went wrong, Please reload the page');
            setIsErrorReload(true);
        }

        // Prepare the arguments array
        // const args = [vendor_id, vendor_order_id];
        // if (error_reason && error_reason != '' && error_reason !== undefined) {
        //     args.push(error_reason);
        // }
        const email = order.picker;
        const data = await updateOrderShipmentError(vendor_id, vendor_order_id, error_reason, email, 'picking',);
        console.log('data', data);
        // return; 
        if (data.success) {
            window.location.reload();
        }
        else {
            setError(true);
            setErrorMessage(data.error);
            setIsErrorReload(true);
        }

    }

    const handleErrorReason = () => {
        setIsOpenModal(true);
    }

    const totalQuantity = order?.items?.length ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    const deliveryDuration = order?.shipping_code ? getShippingDuration(order.shipping_code) : '-';
    return (
        <>
            {isBarcodeInitiated && (
                <div className="flex flex-col h-screen bg-gray-100">
                    {/* Header - updated with blue-gray */}
                    <header className="bg-slate-100 shadow-md py-2 px-4 relative z-10">
                        <div className="flex justify-between items-center">
                            <div className="px-10 py-1 rounded-lg bg-black transition-colors duration-200 -ml-5">
                                <span className="text-sm text-white/90 uppercase tracking-wider">x</span>
                                <span className="text-2xl font-bold text-white">{totalQuantity || '0'}</span>
                            </div>
                            <div className="flex space-x-4">
                                <div>
                                    <p className="text-xs text-gray-500">Customer</p>
                                    <p className="font-semibold text-sm">{order.buyer.name || 'G M'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Delivery</p>
                                    <p className="font-semibold text-sm">{deliveryDuration}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Order</p>
                                    <p className="font-semibold text-sm">{order.vendor_order_id || '#ABCD'}</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main section */}
                    <main className="flex-1 overflow-y-auto p-2">
                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                ref={(el) => (itemRefs.current[index] = el)}
                                className={`bg-white rounded-lg shadow-md mb-2 p-2 flex items-center relative ${selectedItem[index] === index ? 'opacity-50' : ''
                                    }`}
                                style={{ height: `${windowHeight - 160}px` }}
                            >
                                {/* Image column */}
                                <div className="w-1/4 relative h-full">
                                    <div className="absolute inset-0 flex items-center justify-center">

                                        <img
                                            src={item.image || 'https://cdn.indejuice.com/images/4j6.jpg'}
                                            alt="Product"
                                            className="w-full h-full rounded-md object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Quantity column - already centered */}
                                <div className="w-1/5 flex items-center justify-center px-2">
                                    <div className={`
                                        aspect-square w-24 
                                        ${item.quantity > 1 ? 'bg-red-500' : 'bg-blue-500'} 
                                        rounded-xl shadow-md
                                        flex flex-col items-center justify-center
                                        transition-colors duration-200
                                    `}>
                                        <span className="text-4xl font-bold text-white">
                                            {item.quantity || 1}
                                        </span>
                                        <span className="text-sm text-white/90 uppercase tracking-wider">
                                            units
                                        </span>
                                    </div>
                                </div>

                                {/* Product details column - centered */}
                                <div className="w-2/5 px-2 flex flex-col justify-center space-y-2">
                                    {/* Product Name */}
                                    <h3 className="font-bold text-base text-slate-800">
                                        {item.name}
                                    </h3>

                                    {/* Brand */}
                                    <div className="flex items-center">
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Brand:</span>
                                        <span className="ml-2 text-sm font-medium text-slate-700">
                                            {item.brand_name}
                                        </span>
                                    </div>

                                    {/* Attributes */}
                                    <div className="flex flex-wrap gap-1">
                                        {Object.values(item.attributes || {})
                                            .filter(value => value && value.length > 0)
                                            .map((value, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full 
                                                             text-xs font-medium bg-slate-100 text-slate-700"
                                                >
                                                    {Array.isArray(value) ? value.join(', ') : value}
                                                </span>
                                            ))}
                                    </div>
                                </div>

                                {/* Location column - centered */}
                                <div className="w-1/5 flex items-center justify-center">
                                    <LocationDetails styles={styles} location={item.warehouse} />
                                </div>

                                {/* Force Tick Button - moved to bottom right of container */}
                                <button
                                    onClick={() => handleForceTick(index)}
                                    className="absolute bottom-2 right-2 text-slate-400 text-xs 
                                             hover:text-blue-500 transition-colors duration-150
                                             border border-slate-200 rounded px-2 py-1
                                             opacity-70 hover:opacity-100"
                                >
                                    <span className="text-[10px] uppercase tracking-wider">Force tick</span>
                                </button>
                            </div>
                        ))}

                        {/* Add confirmation screen as last item */}
                        {selectedItem.length === order.items.length && (
                            <div
                                onClick={() => handlePicked(false)}
                                className="bg-green-500 hover:bg-green-600 rounded-lg shadow-md mb-2 p-2 flex items-center cursor-pointer transition-colors duration-200"
                                style={{ height: `${windowHeight - 160}px` }}
                            >
                                <div className="w-1/2 flex justify-center items-center">
                                    <div className="text-8xl text-white">
                                        <FaCheckCircle />
                                    </div>
                                </div>
                                <div className="w-1/2 text-white">
                                    <h2 className="text-3xl font-bold mb-4">All Items Picked!</h2>
                                    <p className="text-xl">
                                        Tap anywhere to confirm
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Footer - updated with blue-gray */}
                    <footer className="bg-slate-100 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-2 px-4 flex justify-between items-center h-[60px]">
                        <div className="">
                            <div className="flex items-center space-x-2">
                                <p className="font-semibold text-sm">{extractNameFromEmail(order.picker) || 'Ali B.'}</p>
                                <button
                                    onClick={handleErrorReason}
                                    className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                    <FaExclamationTriangle />
                                </button>
                            </div>
                        </div>
                        {selectedItem.length === order.items.length && (
                            <div onClick={() => handlePicked(true)}>
                                <button className="bg-blue-500 text-white w-[150px] h-[41px] rounded-md flex items-center justify-center text-sm font-semibold">
                                    confirm & sign out
                                </button>
                            </div>
                        )}
                        <div className="mt-2">
                            <ItemBarcode styles={styles} onBarcodeScanned={moveToNextItem} currentItem={order.items[currentIndex]} order={order} />
                        </div>
                    </footer>
                </div>
            )}

            <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} statusClass={'error'}>
                <div className="p-4" onClick={handleErrorQueue}>
                    <h1 className="text-xl font-bold text-red-600">Missing Item</h1>
                </div>
            </PickingAppModal>
        </>
    );
}
