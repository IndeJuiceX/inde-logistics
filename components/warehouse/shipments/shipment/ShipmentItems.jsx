'use client';

import { useState,useContext } from 'react';

import Modal from '@/components/warehouse/modal/Modal';
import ItemModal from '@/components/warehouse/shipments/shipment/ItemModal';
import ShipmentHeader from '@/components/warehouse/ShipmentHeader';
import PageSpinner from '@/components/loader/PageSpinner';
import { LoadingContext } from '@/contexts/LoadingContext';


export default function ShipmentItems({ vendor, shipmentDetailsData }) {
    const { setLoading, setLoaded } = useContext(LoadingContext);
    const [shipmentDetails, setShipmentDetails] = useState(shipmentDetailsData)
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const attributeKeys = [];
    if (shipmentDetails.items && shipmentDetails.items.length > 0) {
        shipmentDetails.items.forEach((item) => {
            const keys = Object.keys(item.attributes || {});
            keys.forEach(key => {
                if (!attributeKeys.includes(key)) {
                    attributeKeys.push(key);
                }
            });
        });
    }
    console.log('attributeKeys', attributeKeys);

    const handleShowItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // Check if all items have the 'received' key
    const allItemsHaveReceivedKey =
        shipmentDetails.items &&
        shipmentDetails.items.every(
            (item) => item.received !== null && item.received !== undefined
        );

    const testClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoaded(true);
            setLoading(false);
        }, 10000);
    }
    const testClick2 = () => {
        setLoading('loaded');
    }
    return (
        <>
            <ShipmentHeader vendor={vendor} shipmentDetails={shipmentDetails} />

            <div className="overflow-x-auto bg-white">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-gray-600 font-semibold">IMAGE</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">PRODUCT</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">BRAND</th>
                            {/* Render table headers dynamically */}
                            {attributeKeys.length > 0 &&
                                attributeKeys.map((attribute, index) => (
                                    <th className="py-3 px-4 text-gray-600 font-semibold" key={index}>
                                        {attribute.toUpperCase()}
                                    </th>
                                ))}
                            <th className="py-3 px-4 text-gray-600 font-semibold">SENT</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">R.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">F.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">A.</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {/* Loop through shipmentDetails.items */}
                        {shipmentDetails.items &&
                            shipmentDetails.items.length > 0 &&
                            shipmentDetails.items.map((item, index) => (
                                <tr
                                    className="border-b hover:bg-gray-50"
                                    key={index}
                                    onClick={() => handleShowItem(item)}
                                >
                                    <td className="py-4 px-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12" />
                                    </td>
                                    <td className="py-4 px-4 flex items-center space-x-2">
                                        {item.name}
                                    </td>
                                    <td className="py-4 px-4">{item.brand_name}</td>

                                    {attributeKeys.length > 0 &&
                                        attributeKeys.map((attribute, index) => (
                                            <td className="py-4 px-4" key={index}>
                                                {item.attributes[attribute]}
                                            </td>
                                        ))}
                                    <td className="py-4 px-4">{item.stock_in}</td>
                                    <td className="py-4 px-4">
                                        {item.received !== null && item.received !== undefined
                                            ? item.received
                                            : '-'}
                                    </td>
                                    <td className="py-4 px-4">
                                        {item.faulty !== null && item.faulty !== undefined
                                            ? item.faulty
                                            : '-'}
                                    </td>
                                    <td className="py-4 px-4">
                                        {item.received !== null &&
                                            item.received !== undefined &&
                                            item.faulty !== null &&
                                            item.faulty !== undefined
                                            ? Math.max(item.received - item.faulty, 0)
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col items-center gap-4 mt-16">
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-500 rounded bg-gray-50" onClick={testClick2} >
                    ADD MISSING ITEM
                </button>
                <button
                    className={`w-full px-4 py-2 text-white rounded ${allItemsHaveReceivedKey
                        ? 'bg-green-500'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!allItemsHaveReceivedKey}
                    onClick={testClick}
                >
                    UPDATE STOCK
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ItemModal
                    itemData={selectedItem}
                    setIsModalOpen={setIsModalOpen}
                    items={shipmentDetails.items}
                    setShipmentDetails={setShipmentDetails}
                />
            </Modal>
        </>
    );
}