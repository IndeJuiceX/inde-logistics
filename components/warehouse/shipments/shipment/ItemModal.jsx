'use client';

import { useState } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';

export default function ItemModal({ setIsModalOpen, item = null }) {
    const [activeField, setActiveField] = useState(null);

    const [sentQuantity, setSentQuantity] = useState(item?.quantity || 0);
    const [receivedQuantity, setReceivedQuantity] = useState(0);
    const [faultyQuantity, setFaultyQuantity] = useState(0);
    const [acceptedQuantity, setAcceptedQuantity] = useState(0);

    const [numberInput, setNumberInput] = useState('');

    const handleActiveClick = (field) => {
        setActiveField(field);
        // Initialize numberInput with the current value of the selected field
        let existingValue = 0;
        if (field === 'sent') {
            existingValue = sentQuantity;
        } else if (field === 'received') {
            existingValue = receivedQuantity;
        } else if (field === 'faulty') {
            existingValue = faultyQuantity;
        } else if (field === 'accepted') {
            existingValue = acceptedQuantity;
        }
        setNumberInput(String(existingValue));
    };

    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            setNumberInput(prev => prev.slice(0, -1));
        } else if (input === 'ok') {
            const number = parseInt(numberInput, 10);
            if (!isNaN(number)) {
                if (activeField === 'sent') {
                    setSentQuantity(number);
                } else if (activeField === 'received') {
                    setReceivedQuantity(number);
                } else if (activeField === 'faulty') {
                    setFaultyQuantity(number);
                } else if (activeField === 'accepted') {
                    setAcceptedQuantity(number);
                }
            }
            // Reset activeField and numberInput after confirming the input
            setActiveField(null);
            setNumberInput('');
        } else {
            // Append the digit to the numberInput
            setNumberInput(prev => prev + input);
        }
    };

    const updateShipment = () => {
        const quantities = {
            sent: activeField === 'sent' ? number : sentQuantity,
            received: activeField === 'received' ? number : receivedQuantity,
            faulty: activeField === 'faulty' ? number : faultyQuantity,
            accepted: activeField === 'accepted' ? number : acceptedQuantity,
        };
        // Use the quantities object as needed
        console.log('Quantities:', quantities);
    }
    return (
        <div className="mt-4 flex flex-col h-full">
            <h2 className="text-center text-lg font-semibold text-black mb-2">{item?.name}</h2>
            <p className="text-center text-sm text-gray-500 mb-4">{item && Object.values(item.attributes)
                .filter(value => !Array.isArray(value))
                .join(' • ')
            }</p>

            <div className="space-y-2 flex-grow">
                <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeField === 'sent' ? 'border-green-500' : ''}`}>
                    <span className="text-black">Sent:</span>
                    <span className="font-semibold text-black">
                        {sentQuantity}
                    </span>
                </div>
                {['received', 'faulty', 'accepted'].map((field, index) => {
                    const fieldNames = {
                        'received': 'Received',
                        'faulty': 'Faulty',
                        'accepted': 'Accepted'
                    };
                    const fieldColors = {
                        'accepted': 'text-blue-500',
                        'received': 'text-black',
                        'faulty': 'text-black'
                    };
                    const fieldQuantities = {
                        'received': receivedQuantity,
                        'faulty': faultyQuantity,
                        'accepted': acceptedQuantity
                    };
                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeField === field ? 'border-green-500' : ''}`}
                            onClick={() => handleActiveClick(field)}
                        >
                            <span className={fieldColors[field]}>{fieldNames[field]}:</span>
                            <span className="font-semibold text-black">
                                {activeField === field ? numberInput || '0' : fieldQuantities[field]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Conditionally render DialPad or additional content */}
            {activeField === null ? (
                <>
                    <div className="flex justify-center mt-4">
                        <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product Image" className="w-[18rem] h-auto " />
                    </div>

                    <div className="flex justify-center mt-2">
                        <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">5056168817092</div>
                    </div>

                    <div className="flex justify-between mt-6 mb-6">
                        <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>Previous</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsModalOpen(false)}>Close</button>
                        <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>Next</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-center text-lg font-semibold mb-2">
                        {`Enter ${activeField.charAt(0).toUpperCase() + activeField.slice(1)} Quantity`}
                    </div>
                    <div className="text-center text-2xl font-bold mb-2">{numberInput || '0'}</div>
                    <DialPad onNumberEntered={handleNumberEntered} />
                </>
            )}
        </div>

    );
}