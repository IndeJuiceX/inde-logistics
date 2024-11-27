'use client';

import { useEffect, useState, useContext } from 'react';
import { useParams } from 'next/navigation';
import DialPad from '@/components/warehouse/keypad/DialPad';
import AlphabetPad from '@/components/warehouse/keypad/AlphabetPad';
import ColorPad from '@/components/warehouse/keypad/ColorPad';
import { GlobalStateContext } from '@/contexts/GlobalStateContext';
import { updateStockShipmentItemAsShelved } from '@/services/data/stock-shipment-item';

export default function UnShelvedItemModal({ setIsModalOpen, itemData = null, items = null, setUnshelvedItems = null }) {
    const params = useParams();
    const { setLoading, setLoaded, setError, setErrorMessage, setErrorRedirect } = useContext(GlobalStateContext);

    const initialIndex = items && itemData ? items.findIndex((i) => i.vendor_sku === itemData.vendor_sku) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [activeField, setActiveField] = useState('aisle');
    const [item, setItem] = useState(itemData);

    const [locations, setLocations] = useState({
        aisle: item?.warehouse?.aisle || '',
        aisleNumber: item?.warehouse?.aisle_number || '',
        shelf: item?.warehouse?.shelf || '',
        shelfNumber: item?.warehouse?.shelf_number || '',
    });

    const showAlphabetPad = () => setActiveField('aisle');
    const showDialPad = (field) => setActiveField(field);
    const showColorPad = () => setActiveField('shelf');

    const handleInput = (value) => {
        setLocations((prev) => ({ ...prev, [activeField]: value }));
        if (activeField === 'aisle') setActiveField('aisleNumber');
        else if (activeField === 'shelf') setActiveField('shelfNumber');
    };

    const handleDialPadInput = (input) => {
        setLocations((prev) => {
            const currentInput = String(prev[activeField] || '');
            if (input === 'backspace') {
                return { ...prev, [activeField]: currentInput.slice(0, -1) };
            } else if (input === 'ok') {
                if (activeField === 'aisleNumber') setActiveField('shelf');
                else if (activeField === 'shelfNumber') setActiveField(null);
                return prev;
            } else {
                return { ...prev, [activeField]: currentInput + input };
            }
        });
        if (input === 'ok') updateLocationsDetails();
    };

    useEffect(() => {
        if (items && items.length > 0) {
            setItem(items[currentIndex]);
        }
    }, [currentIndex, items]);

    useEffect(() => {
        if (item) {
            setLocations({
                aisle: item?.warehouse?.aisle || '',
                aisleNumber: item?.warehouse?.aisle_number || '',
                shelf: item?.warehouse?.shelf || '',
                shelfNumber: item?.warehouse?.shelf_number || '',
            });
        }
    }, [item]);

    const handleNext = () => {
        if (items && currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveField('aisle');
        }
    };

    const handlePrevious = () => {
        if (items && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setActiveField('aisle');
        }
    };

    const updateLocationsDetails = async () => {
        setLoading(true);
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
        };

        if (!payload.item.warehouse.aisle || !payload.item.warehouse.aisle_number || !payload.item.warehouse.shelf || !payload.item.warehouse.shelf_number) {
            setLoaded(true);
            setLoading(false);
            setError(true);
            setErrorMessage('Please enter all the fields');
            setErrorRedirect(null);
            return;
        }

        await updateStockShipmentItemAsShelved(params.vendor_id, params.shipment_id, payload.item);
        setLoaded(true);
        setLoading(false);
    };

    const moveToNextField = () => {
        const fields = ['aisle', 'aisleNumber', 'shelf', 'shelfNumber'];
        const currentIndex = fields.indexOf(activeField);
        if (currentIndex < fields.length - 1) {
            setActiveField(fields[currentIndex + 1]);
        } else {
            setActiveField(null);
        }
    };

    const moveToPreviousField = () => {
        const fields = ['aisle', 'aisleNumber', 'shelf', 'shelfNumber'];
        const currentIndex = fields.indexOf(activeField);
        if (currentIndex > 0) {
            setActiveField(fields[currentIndex - 1]);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full bg-white rounded-lg shadow-lg overflow-y-scroll">
            <div className="lg:w-1/2 p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">{item?.name}</h2>
                <p className="text-sm text-center text-gray-500">
                    {item && Object.values(item.attributes).filter((value) => !Array.isArray(value)).join(' • ')}
                </p>

                <div className="flex justify-center space-x-4">
                    <LocationBox
                        label="Aisle"
                        value={locations.aisle}
                        numberValue={locations.aisleNumber}
                        onLetterClick={showAlphabetPad}
                        onNumberClick={() => showDialPad('aisleNumber')}
                        isActive={activeField === 'aisle' || activeField === 'aisleNumber'}
                    />
                    <LocationBox
                        label="Shelf"
                        value={locations.shelf}
                        numberValue={locations.shelfNumber}
                        onLetterClick={showColorPad}
                        onNumberClick={() => showDialPad('shelfNumber')}
                        isActive={activeField === 'shelf' || activeField === 'shelfNumber'}
                    />
                </div>

                <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item?.image} alt="Product" className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl object-contain rounded-md shadow-md" />
                </div>

                {/* <div className="flex justify-center">
                    <div className="bg-gray-800 text-white text-sm font-mono px-3 py-1 rounded-md">
                        {item?.barcode}
                    </div>
                </div> */}

                <div className="flex justify-between mt-4">
                    <button
                        className={`px-4 py-2 rounded-md ${currentIndex <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        disabled={currentIndex <= 0}
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Close
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${items && currentIndex >= items.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        disabled={items && currentIndex >= items.length - 1}
                        onClick={handleNext}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="lg:w-1/2 p-4 bg-gray-100">
                {activeField === 'aisle' && <AlphabetPad onValueSelected={handleInput} />}
                {activeField === 'shelf' && <ColorPad onValueSelected={handleInput} />}
                {(activeField === 'aisleNumber' || activeField === 'shelfNumber') && (
                    <DialPad onNumberEntered={handleDialPadInput} />
                )}
                {activeField && (
                    <div className="mt-4 flex justify-between">
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            onClick={moveToPreviousField}
                        >
                            Previous Field
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            onClick={moveToNextField}
                        >
                            Next Field
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function LocationBox({ label, value, numberValue, onLetterClick, onNumberClick, isActive }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-gray-500 mb-1">{label}</span>
            <div className={`flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-2 ${isActive ? 'border-blue-500' : 'border-gray-300'}`}>
                <button
                    className="flex items-center justify-center w-10 h-10 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onLetterClick}
                >
                    {value || '-'}
                </button>
                <button
                    className="flex items-center justify-center w-10 h-10 bg-white text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onNumberClick}
                >
                    {numberValue || '-'}
                </button>
            </div>
        </div>
    );
}

