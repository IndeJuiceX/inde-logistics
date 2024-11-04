'use client';

import { useState, useEffect } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';
import { useParams } from 'next/navigation';
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import AlphabetPad from '@/components/warehouse/keypad/AlphabetPad';
import ColorPad from '../keypad/ColorPad';

export default function UnShelvedItemModal({ setIsModalOpen, itemData = null, items = null, setShipmentDetails = null }) {
    const params = useParams();
    const [showAlphabet, setShowAlphabet] = useState(false);


    // Find the initial index of the itemData in items
    const initialIndex = items && itemData ? items.findIndex(i => i.vendor_sku === itemData.vendor_sku) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const [activeField, setActiveField] = useState(null);
    const [item, setItem] = useState(itemData);

    console.log('item:', item);

    const [locations, setQuantities] = useState({
        aisle: item?.stock_in || 0,
        aisleNumber: item?.received || 0,
        shelf: 0,
        shelfNumber: 0,
    });

    const fieldNames = {
        aisle: 'aisle',
        received: 'Received',
        faulty: 'Faulty',
        accepted: 'Accepted',
    };

    const fieldColors = {
        accepted: 'text-blue-500',
        received: 'text-black',
        faulty: 'text-black',
    };

    const handleNumberEntered = (input) => {
        
    };

    

    const handleNext = async () => {

        if (items && currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveField(null);
            setNumberInput('');
        }
    };

    const handlePrevious = async () => {
        if (items && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setActiveField(null);
            setNumberInput('');
        }
    };

    const showAlphabetPad = () => {
        setShowAlphabet(true);
        setActiveField('aisle');
    }

    return (
        // <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="mt-4 flex flex-col h-full">
            <h2 className="text-center text-lg font-semibold text-black mb-2">{item?.name}</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
                {item &&
                    Object.values(item.attributes)
                        .filter((value) => !Array.isArray(value))
                        .join(' • ')}
            </p>

            <div class="flex justify-center items-center space-x-2 mb-4 text-center">
                <div class="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black">
                    <div class="px-2 py-1" onClick={showAlphabetPad}>M</div>
                    <div class="bg-white text-gray-800 px-2 py-1" onClick={showDialPad} >3</div>
                </div>
                <div class="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black">
                    <div class="px-2 py-1" onClick={showColorPad}>Red</div>
                    <div class="bg-white text-gray-800 px-2 py-1" onClick={showDialPad}>10</div>
                </div>
            </div>



            {activeField === null ? (
                <>
                    <div className="flex justify-center mb-8 mt-8">
                        <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product" className="w-[18rem] h-auto rounded-md shadow-lg" />
                    </div>

                    <div className="flex justify-center mt-6 mb-6">
                        <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">{item?.barcode}4234242342343242342</div>
                    </div>

                    <div className="flex justify-between w-full mb-4">
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
                    <DialPad onNumberEntered={handleNumberEntered} />
                    <AlphabetPad />
                    <ColorPad />
                </>
            )}
        </div>
        // </div>

    );
}