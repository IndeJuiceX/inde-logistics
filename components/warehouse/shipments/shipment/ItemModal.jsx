'use client';

import { useState, useEffect, useContext } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';
import { useParams } from 'next/navigation';
import { GlobalStateContext } from '@/contexts/GlobalStateContext';
import { AiOutlineLeft, AiOutlineRight, AiOutlineClose } from 'react-icons/ai';
import { updateStockShipmentItemReceived } from '@/services/data/stock-shipment-item';
import { getStockShipmentDetails } from '@/services/data/stock-shipment';
import { getLoggedInUser } from '@/app/actions';


export default function ItemModal({ setIsModalOpen, itemData = null, items = null, setShipmentDetails = null }) {
    const { setLoading, setLoaded } = useContext(GlobalStateContext);
    const params = useParams();

    // Find the initial index of the itemData in items
    const initialIndex = items && itemData ? items.findIndex(i => i.vendor_sku === itemData.vendor_sku) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const [activeField, setActiveField] = useState('received');
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
        // const allowedFields = ['received', 'faulty', 'vendor_sku']
        const user = await getLoggedInUser()
        try {
            setLoading(true);
            const submit = await updateStockShipmentItemReceived(params.vendor_id, params.shipment_id, {
                received: quantities.accepted,
                faulty: quantities.faulty,
                vendor_sku: item.vendor_sku
            }, user);

            const updatedDetails = await getStockShipmentDetails(params.vendor_id, params.shipment_id);
            console.log('updatedDetails', updatedDetails)
            setShipmentDetails(updatedDetails.data);
            handleNext();

        } catch (error) {
            console.error('Error updating shipment:', error);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    useEffect(() => {
        if (item) {
            const newQuantities = {
                sent: item.stock_in || 0,
                received: item.received || 0,
                faulty: 0,
                accepted: Math.max(0, (item.received || 0) - 0),
            };
            setQuantities(newQuantities);
            // No need to set numberInput here
        }
    }, [item]);

    useEffect(() => {
        if (activeField && quantities[activeField] !== undefined) {
            setNumberInput(quantities[activeField].toString());
        }
    }, [item, quantities, activeField]);

    const handleActiveClick = (field) => {
        setActiveField(field);
        setNumberInput(quantities[field].toString());
    };

    const handleNext = async () => {
        if (items && currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveField('received');
            // Remove setNumberInput('')
        }
    };

    const handlePrevious = async () => {
        if (items && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setActiveField('received');
            // Remove setNumberInput('')
        }
    };

    return (
        <div className="flex flex-col h-full p-4 bg-gray-50">
            {/* Header Section */}
            <div className="relative flex items-center justify-center mb-4">
                {/* Close Button */}
                <button
                    className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                    onClick={() => setIsModalOpen(false)}
                >
                    <AiOutlineClose size={24} />
                </button>
                {/* item 3/55 */}
                <div className='absolute top-0 left-0'>
                    {item && item.attributes.length > 0 && (
                        <p className="text-lg text-gray-600">
                            {item.attributes.map((attr) => attr.name).join(' • ')}
                        </p>
                    )}
                </div>

                {/* Previous Button */}
                <button
                    className={`p-2 text-gray-600 hover:text-gray-800 ${currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={currentIndex <= 0}
                    onClick={handlePrevious}
                >
                    <AiOutlineLeft size={24} />
                </button>

                {/* Title and Subtitle */}
                <div className="mx-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{item?.name}</h2>
                    <p className="text-lg text-gray-600">
                        {item &&
                            Object.values(item.attributes)
                                .filter((value) => !Array.isArray(value))
                                .join(' • ')}
                    </p>
                </div>

                {/* Next Button */}
                <button
                    className={`p-2 text-gray-600 hover:text-gray-800 ${items && currentIndex >= items.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={items && currentIndex >= items.length - 1}
                    onClick={handleNext}
                >
                    <AiOutlineRight size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Quantities Section */}
                <div className="flex flex-col gap-4 flex-1">
                    {/* Sent Quantity */}
                    <div className="flex justify-between items-center p-4 bg-yellow-100 rounded-lg">
                        <span className="text-lg text-gray-700">Sent:</span>
                        <span className="text-2xl font-bold text-gray-900">{quantities.sent}</span>
                    </div>

                    {/* Editable Quantities */}
                    {['received', 'faulty'].map((field) => (
                        <div
                            key={field}
                            className={`flex justify-between items-center p-4 bg-white rounded-lg border-2 ${activeField === field ? 'border-green-500' : 'border-transparent'
                                } cursor-pointer`}
                            onClick={() => handleActiveClick(field)}
                        >
                            <span className="text-lg text-gray-700">{fieldNames[field]}:</span>
                            <span className="text-2xl font-bold text-gray-900">{quantities[field]}</span>
                        </div>
                    ))}

                    {/* Accepted Quantity */}
                    <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg">
                        <span className="text-lg text-gray-700">Accepted:</span>
                        <span className="text-2xl font-bold text-gray-900">{quantities.accepted}</span>
                    </div>

                    {/* Image and Barcode */}
                    <div className="flex flex-col items-center gap-4 mt-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item?.image}
                            alt="Product"
                            className="max-h-[60%] w-auto rounded-lg"
                        />
                        {/* <div className="bg-gray-800 px-4 py-2 rounded-lg">
                            <div className="text-white font-mono text-lg">{item?.barcode}</div>
                        </div> */}
                    </div>
                </div>

                {/* Dial Pad Section */}
                {activeField !== null && (
                    <div className="flex flex-col justify-center flex-1">
                        <div className="text-center text-xl font-bold text-gray-800 mb-2">
                            {`Enter ${fieldNames[activeField]} Quantity`}
                        </div>
                        <div className="text-center text-4xl font-extrabold text-gray-900 mb-4">
                            {numberInput || '0'}
                        </div>
                        <DialPad onNumberEntered={handleNumberEntered} />
                    </div>
                )}
            </div>
        </div >
    );
}