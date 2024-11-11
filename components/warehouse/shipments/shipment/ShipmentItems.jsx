'use client';

import React, { useState, useContext } from 'react';
import { useParams } from 'next/navigation';

import Modal from '@/components/warehouse/modal/Modal';
import ItemModal from '@/components/warehouse/shipments/shipment/ItemModal';
import ShipmentHeader from '@/components/warehouse/ShipmentHeader';
import PageSpinner from '@/components/loader/PageSpinner';
import { GlobalStateContext } from '@/contexts/GlobalStateContext';
import MissingItem from '@/components/warehouse/shipments/shipment/MissingItem';

export default function ShipmentItems({ vendor, shipmentDetailsData }) {
    const params = useParams();
    const { setLoading, setLoaded } = useContext(GlobalStateContext);
    console.log('shipmentDetailsData', shipmentDetailsData.items);

    // const [shipmentDetails, setShipmentDetails] = useState({
    //     ...shipmentDetailsData,
    //     items: shipmentDetailsData.items.sort((a, b) =>
    //         new Date(a.updated_at) - new Date(b.updated_at)
    //     ),
    // });
    const [shipmentDetails, setShipmentDetails] = useState(shipmentDetailsData);

    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModalItem, setSelectedModalItem] = useState(null);
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);

    const attributeKeys = [];

    const handleShowItem = (item) => {
        setSelectedModalItem('item')
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const allItemsHaveReceivedKey =
        shipmentDetails.items &&
        shipmentDetails.items.every(
            (item) => item.received !== null && item.received !== undefined
        );

    const updateConfirmStock = async () => {
        setLoading(true);
        console.log('shipmentDetails', shipmentDetails);
        const payload = {
            vendor_id: params.vendor_id,
            stock_shipment_id: params.shipment_id,
        }
        console.log('payload', payload);
        const response = await fetch('/api/v1/admin/stock-shipments/update-stock-shipment', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        console.log('return response', data);
        setLoaded(true);
        setLoading(false);
    }

    const handleMissingItem = async () => {
        setSelectedModalItem('missingItem');
        setIsModalOpen(true);
    }

    const handleToggleShowMore = (rowIndex) => {
        if (expandedRowIndex === rowIndex) {
            setExpandedRowIndex(null);
        } else {
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
            setExpandedRowIndex(rowIndex);
        }
    };
    const sortedItems = shipmentDetails.items.sort((a, b) =>
        new Date(a.updated_at) - new Date(b.updated_at)
    );
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
                            <th className="py-3 px-4 text-gray-600 font-semibold">SENT</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">R.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">F.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">A.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {shipmentDetails.items &&
                            shipmentDetails.items.length > 0 &&
                            shipmentDetails.items.map((item, index) => (
                                <React.Fragment key={index}>
                                    <tr
                                        className="border-b hover:bg-gray-50"
                                        onClick={() => handleShowItem(item)}
                                    >
                                        <td className="py-4 px-4">
                                            <img src={item.image} alt={item.name} className="w-12 h-12" />
                                        </td>
                                        <td className="py-4 px-4 flex items-center space-x-2">
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-4">{item.brand_name}</td>
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
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleShowMore(index);
                                                }}
                                                className="text-blue-500 underline"
                                            >
                                                {expandedRowIndex === index
                                                    ? 'Show Less'
                                                    : 'Show More'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRowIndex === index && (
                                        <tr>
                                            <td colSpan={8} className="bg-gray-50">
                                                <div className="py-4 px-4">
                                                    <div className="font-bold text-lg mb-2">Attributes</div>
                                                    {Object.entries(item.attributes).map(([key, value]) => (
                                                        <div key={key} className="flex">
                                                            <div className="font-semibold w-1/3">{key}:</div>
                                                            <div className="w-2/3">{value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col items-center gap-4 mt-16">
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-500 rounded bg-gray-50" onClick={handleMissingItem}>
                    ADD MISSING ITEM
                </button>
                <button
                    className={`w-full px-4 py-2 text-white rounded ${allItemsHaveReceivedKey
                        ? 'bg-green-500'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!allItemsHaveReceivedKey}
                    onClick={updateConfirmStock}
                >
                    UPDATE STOCK
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} classNames={selectedModalItem === 'missingItem' ? 'w-[80%]' : null}>
                {selectedModalItem === 'missingItem' && (
                    <MissingItem
                        vendor_id={params.vendor_id}
                        shipment_id={params.shipment_id}
                        setIsModalOpen={setIsModalOpen}
                        setShipmentDetails={setShipmentDetails}
                    />
                )}
                {selectedModalItem === 'item' && (
                    <ItemModal
                        itemData={selectedItem}
                        setIsModalOpen={setIsModalOpen}
                        items={shipmentDetails.items}
                        setShipmentDetails={setShipmentDetails}
                    />
                )}
            </Modal>
        </>
    );
}