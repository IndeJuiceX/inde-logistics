'use client';

import { useState } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';

export default function ItemModal({ setIsModalOpen, item = null }) {
    const [activeField, setActiveField] = useState(null);

    // Use a single state object for quantities
    const [quantities, setQuantities] = useState({
        sent: item?.quantity || 0,
        received: 0,
        faulty: 0,
        accepted: 0,
    });

    const [numberInput, setNumberInput] = useState('');

    const handleActiveClick = (field) => {
        setActiveField(field);
        // Initialize numberInput with the current value of the selected field
        setNumberInput(quantities[field].toString());
    };

    // Helper function to update quantities and recalculate 'Accepted'
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
            updateShipment();
            setActiveField(null);
            setNumberInput('');
        } else {
            // Append the digit to numberInput
            const newNumberInput = numberInput + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setNumberInput(newNumberInput);
            updateQuantity(activeField, parsedValue);
        }
    };

    const updateShipment = () => {
        console.log('Quantities:', quantities);
        // Use the quantities object as needed
    };

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
                        <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product" className="w-[18rem] h-auto" />
                    </div>

                    <div className="flex justify-center mt-2">
                        <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">5056168817092</div>
                    </div>

                    <div className="flex justify-between mt-6 mb-6">
                        <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>
                            Previous
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsModalOpen(false)}>
                            Close
                        </button>
                        <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>
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