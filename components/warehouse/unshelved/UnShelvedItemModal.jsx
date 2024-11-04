'use client';

import { useState } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';
import { useParams } from 'next/navigation';
// Import statements for your services and pads
import { getStockShipmentDetails } from "@/services/data/stock-shipment";
import AlphabetPad from '@/components/warehouse/keypad/AlphabetPad';
import ColorPad from '@/components/warehouse/keypad/ColorPad';

export default function UnShelvedItemModal({
    setIsModalOpen,
    itemData = null,
    items = null,
    setShipmentDetails = null,
}) {
    const params = useParams();

    // State variables
    const initialIndex =
        items && itemData
            ? items.findIndex((i) => i.vendor_sku === itemData.vendor_sku)
            : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [activeField, setActiveField] = useState(null);
    const [item, setItem] = useState(itemData);


    const [locations, setLocations] = useState({
        aisle: item?.stock_in || '',
        aisleNumber: item?.received || '',
        shelf: '',
        shelfNumber: '',
    });

    // Functions to show pads
    const showAlphabetPad = () => {
        setActiveField('aisle');
    };

    const showDialPad = (field) => {
        setActiveField(field); // e.g., 'aisleNumber' or 'shelfNumber'
    };

    const showColorPad = () => {
        setActiveField('shelf');
    };

    // Handle input from pads
    const handleInput = (value) => {
        setLocations((prevLocations) => ({
            ...prevLocations,
            [activeField]: value,
        }));
        setActiveField(null); // Close the pad after input
    };

    // Navigation functions
    const handleNext = async () => {
        if (items && currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveField(null);
        }
    };

    const handlePrevious = async () => {
        if (items && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setActiveField(null);
        }
    };

    return (
        <div className="mt-4 flex flex-col h-full">
            <h2 className="text-center text-lg font-semibold text-black mb-2">
                {item?.name}
            </h2>
            <p className="text-center text-sm text-gray-500 mb-4">
                {item &&
                    Object.values(item.attributes)
                        .filter((value) => !Array.isArray(value))
                        .join(' • ')}
            </p>

            {/* Display the location details */}
            <div className="flex justify-center items-center space-x-2 mb-4 text-center">
                {/* Aisle and Aisle Number */}
                <div className="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black h-12 w-24">
                    <div className="flex items-center justify-center w-1/2 h-full text-lg" onClick={showAlphabetPad}>
                        {locations.aisle || ''}
                    </div>
                    <div
                        className="flex items-center justify-center w-1/2 h-full bg-white text-gray-800 text-lg"
                        onClick={() => showDialPad('aisleNumber')}
                    >
                        {locations.aisleNumber || ''}
                    </div>
                </div>
                {/* Shelf and Shelf Number */}
                <div className="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black h-12 w-24">
                    <div className="flex items-center justify-center w-1/2 h-full text-lg" onClick={showColorPad}>
                        {locations.shelf || ''}
                    </div>
                    <div
                        className="flex items-center justify-center w-1/2 h-full bg-white text-gray-800 text-lg"
                        onClick={() => showDialPad('shelfNumber')}
                    >
                        {locations.shelfNumber || ''}
                    </div>
                </div>
            </div>



            {/* Conditional rendering of pads */}
            {activeField === null ? (
                <>
                    {/* Display image and other details when no pad is active */}
                    <div className="flex justify-center mb-8 mt-8">
                        <img
                            src="https://cdn.indejuice.com/images/ZAE_small.jpg"
                            alt="Product"
                            className="w-[18rem] h-auto rounded-md shadow-lg"
                        />
                    </div>

                    <div className="flex justify-center mt-6 mb-6">
                        <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">
                            {item?.barcode}
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between w-full mb-4">
                        <button
                            className={`bg-gray-200 text-gray-500 px-4 py-2 rounded-md ${currentIndex <= 0 ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            disabled={currentIndex <= 0}
                            onClick={handlePrevious}
                        >
                            Previous
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-md"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                        <button
                            className={`bg-gray-200 text-gray-500 px-4 py-2 rounded-md ${items && currentIndex >= items.length - 1
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                                }`}
                            disabled={items && currentIndex >= items.length - 1}
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <>

                    {activeField === 'aisle' && (
                        <AlphabetPad onValueSelected={handleInput} />
                    )}
                    {activeField === 'shelf' && (
                        <ColorPad onValueSelected={handleInput} />
                    )}
                    {(activeField === 'aisleNumber' || activeField === 'shelfNumber') && (
                        <div className="bg-gray-200 p-4 rounded-lg  overflow-y-auto relative top-[37%]">
                            <DialPad onNumberEntered={handleInput} />
                        </div>
                    )}

                </>
            )}
        </div>
    );
}