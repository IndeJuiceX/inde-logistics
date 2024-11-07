'use client';

import { useState, useEffect, useContext } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';
import { useParams } from 'next/navigation';
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import { GlobalStateContext } from '@/contexts/GlobalStateContext';

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
        <div className="mt-4 flex flex-col h-full">
            <h2 className="text-center text-lg font-semibold text-black mb-2">{item?.name}</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
                {item &&
                    Object.values(item.attributes)
                        .filter((value) => !Array.isArray(value))
                        .join(' • ')}
            </p>

            <div className="space-y-2 flex-grow">
                {/* Sent Quantity */}
                <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeField === 'sent' ? 'border-green-500' : ''}`}>
                    <span className="text-black">Sent:</span>
                    <span className="font-semibold text-black">{quantities.sent}</span>
                </div>

                {/* Editable Quantities */}
                {['received', 'faulty'].map((field) => (
                    <div
                        key={field}
                        className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeField === field ? 'border-green-500' : ''}`}
                        onClick={() => handleActiveClick(field)}
                    >
                        <span className={fieldColors[field]}>{fieldNames[field]}:</span>
                        <span className="font-semibold text-black">{quantities[field]}</span>
                    </div>
                ))}

                {/* Accepted Quantity (Computed and Non-Editable) */}
                <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md`}>
                    <span className={fieldColors['accepted']}>{fieldNames['accepted']}:</span>
                    <span className="font-semibold text-black">{quantities.accepted}</span>
                </div>
            </div>

            {/* Conditionally render DialPad or additional content */}
            {activeField === null ? (
                <>
                    <div className="flex justify-center mt-4">
                        {/* eslint-disable-next-line */}
                        <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product" className="w-[18rem] h-auto" />
                    </div>

                    <div className="flex justify-center mt-2">
                        <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">{item?.barcode}</div>
                    </div>

                    <div className="flex justify-between mb-8">
                        <button
                            className={`bg-gray-200 text-gray-500 px-4 py-2 rounded-md ${currentIndex <= 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                            disabled={currentIndex <= 0}
                            onClick={handlePrevious}
                        >
                            Previous
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsModalOpen(false)}>
                            Close
                        </button>
                        <button
                            className={`bg-gray-200 text-gray-500 px-4 py-2 rounded-md ${items && currentIndex >= items.length - 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                            disabled={items && currentIndex >= items.length - 1}
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-center text-lg font-semibold mb-2">
                        {`Enter ${fieldNames[activeField]} Quantity`}
                    </div>
                    <div className="text-center text-2xl font-bold mb-2">{numberInput || '0'}</div>
                    <DialPad onNumberEntered={handleNumberEntered} />
                </>
            )}
        </div>
    );
}