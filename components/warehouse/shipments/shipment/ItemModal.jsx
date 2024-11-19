'use client';

import { useState, useEffect, useContext } from 'react';
import DialPad from '@/components/warehouse/keypad/DialPad';
import { useParams } from 'next/navigation';
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import { GlobalStateContext } from '@/contexts/GlobalStateContext';
import styles from '@/styles/warehouse/modals/itemModal.module.scss';

export default function ItemModal({ setIsModalOpen, itemData = null, items = null, setShipmentDetails = null }) {
    const { setLoading, setLoaded } = useContext(GlobalStateContext);
    const params = useParams();

    // Find the initial index of the itemData in items
    const initialIndex = items && itemData ? items.findIndex(i => i.vendor_sku === itemData.vendor_sku) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const [activeField, setActiveField] = useState(null);
    const [item, setItem] = useState(itemData);

    const [quantities, setQuantities] = useState({
        sent: item?.stock_in || 0,
        received: item?.received || 0,
        faulty: 0,
        accepted: 0,
    });

    const fieldNames = {
        sent: 'Sent',
        received: 'Received',
        faulty: 'Faulty',
        accepted: 'Accepted',
    };

    const fieldColors = {
        accepted: 'text-blue-500',
        received: 'text-black',
        faulty: 'text-black',
    };

    const [numberInput, setNumberInput] = useState('');

    // Update 'item' when 'currentIndex' changes
    useEffect(() => {
        if (items && items.length > 0) {
            const newItem = items[currentIndex];
            setItem(newItem);
        }
    }, [currentIndex, items]);

    // Reset 'quantities' when 'item' changes
    useEffect(() => {
        if (item) {
            setQuantities({
                sent: item.stock_in || 0,
                received: item.received || 0,
                faulty: 0,
                accepted: Math.max(0, (item.received || 0) - 0),
            });
        }
    }, [item]);

    const handleActiveClick = (field) => {
        setActiveField(field);
        setNumberInput(quantities[field].toString());
    };

    const updateQuantity = (field, value) => {
        const sanitizedValue = Math.max(0, value);
        setQuantities(prev => {
            const newQuantities = {
                ...prev,
                [field]: sanitizedValue,
            };
            newQuantities.accepted = Math.max(0, newQuantities.received - newQuantities.faulty);
            return newQuantities;
        });
    };

    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newNumberInput = numberInput.slice(0, -1);
            const parsedValue = parseInt(newNumberInput || '0', 10);
            setNumberInput(newNumberInput);
            updateQuantity(activeField, parsedValue);
        } else if (input === 'ok') {
            // On 'ok', reset activeField and numberInput
            updateShipmentItem();
            setActiveField(null);
            setNumberInput('');
        } else {
            const newNumberInput = numberInput + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setNumberInput(newNumberInput);
            updateQuantity(activeField, parsedValue);
        }
    };

    const updateShipmentItem = async () => {
        setLoading(true);
        console.log('Quantities:', quantities);
        const updatePayload = {
            vendor_id: params.vendor_id,
            stock_shipment_id: params.shipment_id,
            item: {
                received: quantities.accepted,
                faulty: quantities.faulty,
                vendor_sku: item.vendor_sku,
            },
        };
        const response = await fetch('/api/v1/admin/stock-shipments/update-item-received', {
            method: 'PATCH',
            body: JSON.stringify(updatePayload),
        });
        if (!response.ok) {
            console.log('Error in update stock shipment');
            return;
        }
        const data = await response.json();
        getUpdateShipmentDetails();
        console.log('Response:', data);
        handleNext();
        setLoading(false);
        setLoaded(true);
    };

    const handleNext = async () => {

        if (items && currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveField(null);
            setNumberInput('');
        }
    };

    const handlePrevious = async () => {
        // Save current item data before moving to the previous
        // await updateShipmentItem();

        if (items && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setActiveField(null);
            setNumberInput('');
        }
    };

    const getUpdateShipmentDetails = async () => {
        const response = await fetch(`/api/v1/vendor/stock-shipments?vendor_id=${params.vendor_id}&stock_shipment_id=${params.shipment_id}`);
        const updateShipments = await response.json();
        if (updateShipments.success) {
            setShipmentDetails(updateShipments.data);
        }
    }
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{item?.name}</h2>
            <p className={styles.subtitle}>
                {item &&
                    Object.values(item.attributes)
                        .filter((value) => !Array.isArray(value))
                        .join(' • ')}
            </p>

            <div className={styles.gridWrapper}>
                <div className={styles.content}>
                    {/* Sent Quantity */}
                    <div className={`${styles.quantityItem} ${styles.sent} ${activeField === 'sent' ? styles.active : ''}`}>
                        <span className={styles.label}>Sent:</span>
                        <span className={styles.value}>{quantities.sent}</span>
                    </div>

                    {/* Editable Quantities */}
                    {['received', 'faulty'].map((field) => (
                        <div
                            key={field}
                            className={`${styles.quantityItem} ${activeField === field ? styles.active : ''}`}
                            onClick={() => handleActiveClick(field)}
                        >
                            <span className={styles.label}>{fieldNames[field]}:</span>
                            <span className={styles.value}>{quantities[field]}</span>
                        </div>
                    ))}

                    {/* Accepted Quantity (Computed and Non-Editable) */}
                    <div className={`${styles.quantityItem} ${styles.accepted}`}>
                        <span className={styles.label}>{fieldNames['accepted']}:</span>
                        <span className={styles.value}>{quantities.accepted}</span>
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    {/* eslint-disable-next-line */}
                    <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product" className={styles.productImage} />
                </div>
                {/* Conditionally render DialPad or additional content */}
                {activeField === null ? (
                    <>

                        <div className={styles.barcodeWrapper}>
                            <div className={styles.barcode}>{item?.barcode}</div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.button} ${currentIndex <= 0 ? styles.disabledButton : ''}`}
                                disabled={currentIndex <= 0}
                                onClick={handlePrevious}
                            >
                                Previous
                            </button>
                            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            <button
                                className={`${styles.button} ${items && currentIndex >= items.length - 1 ? styles.disabledButton : ''}`}
                                disabled={items && currentIndex >= items.length - 1}
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.dialPadTitle}>
                            {`Enter ${fieldNames[activeField]} Quantity`}
                        </div>
                        <div className={styles.dialPadDisplay}>{numberInput || '0'}</div>
                        <DialPad onNumberEntered={handleNumberEntered} />
                    </>
                )}
            </div>
        </div>
    );
}