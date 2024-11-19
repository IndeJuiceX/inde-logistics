'use client';

import { useEffect, useState, useContext } from 'react';
import DialPad from '@/components/warehouse/keypad/DialPad';
import { useParams } from 'next/navigation';
import AlphabetPad from '@/components/warehouse/keypad/AlphabetPad';
import ColorPad from '@/components/warehouse/keypad/ColorPad';
import { GlobalStateContext } from '@/contexts/GlobalStateContext';


export default function UnShelvedItemModal({ setIsModalOpen, itemData = null, items = null, setUnshelvedItems = null, }) {
    const params = useParams();
    const { setLoading, setLoaded } = useContext(GlobalStateContext);

    // State variables
    const initialIndex =
        items && itemData
            ? items.findIndex((i) => i.vendor_sku === itemData.vendor_sku)
            : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [activeField, setActiveField] = useState(null);
    const [item, setItem] = useState(itemData);


    const [locations, setLocations] = useState({
        aisle: item?.warehouse?.aisle || '',
        aisleNumber: item?.warehouse?.aisle_number || '',
        shelf: item?.warehouse?.shelf || '',
        shelfNumber: item?.warehouse?.shelf_number || '',
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
        if (activeField === 'aisle') {
            setActiveField('aisleNumber');

        } else
            if (activeField === 'shelf') {
                setActiveField('shelfNumber');
            }
    };

    const handleDialPadInput = (input) => {
        setLocations((prevLocations) => {
            const currentInput = prevLocations[activeField] || '';

            if (input === 'backspace') {
                // const newInput = currentInput.slice(0, -1);
                const newInput = currentInput.length > 0 ? currentInput.slice(0, -1) : '';
                return {
                    ...prevLocations,
                    [activeField]: newInput,
                };
            } else if (input === 'ok') {
                // Move to the next field or close the pad
                if (activeField === 'aisleNumber') {
                    setActiveField('shelf');
                } else if (activeField === 'shelfNumber') {
                    setActiveField(null); // All inputs are complete
                }
                return prevLocations;
            } else {
                const newInput = currentInput + input;
                return {
                    ...prevLocations,
                    [activeField]: newInput,
                };
            }
        });
        if (input === 'ok') {
            updateLocationsDetails()
        }
    };

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
            setLocations({
                aisle: item?.warehouse?.aisle,
                aisleNumber: item?.warehouse?.aisle_number,
                shelf: item?.warehouse?.shelf,
                shelfNumber: item?.warehouse?.shelf_number,
            })
        }
    }, [item]);


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

    useEffect(() => {
        console.log('locations', locations);

    }, [locations]);

    const updateLocationsDetails = async () => {
        setLoading(true);
        console.log('location', locations);
        const payload = {
            vendor_id: params.vendor_id,
            stock_shipment_id: params.shipment_id,
            item: {
                vendor_sku: item.vendor_sku,
                warehouse: {
                    aisle: locations.aisle,
                    aisle_number: locations.aisleNumber,
                    shelf: locations.shelf,
                    shelf_number: locations.shelfNumber,
                }
            }
        }
        console.log('payload', payload);
        const response = await fetch('/api/v1/admin/stock-shipments/shelve-item', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        console.log('update shelved response', response);

        // getUpdateUnShelvedShipmentDetails();
        setLoaded(true);
        setLoading(false);
        // const response = await fetch('');
        // const data = await response.json();
    }

    const getUpdateUnShelvedShipmentDetails = async () => {
        const response = await fetch(`/api/v1/admin/stock-shipments/get-unshelved-items?vendor_id=${params.vendor_id}&stock_shipment_id=${params.shipment_id}`);
        const updateShipments = await response.json();
        if (updateShipments.success) {
            setUnshelvedItems(updateShipments.data.items);
        }
    }
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
                        {/* eslint-disable-next-line */}
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
                            <DialPad onNumberEntered={handleDialPadInput} />
                        </div>
                    )}

                </>
            )}
        </div>
    );
}