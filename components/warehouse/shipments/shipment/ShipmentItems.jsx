'use client';

import { useState } from 'react';
import Link from "next/link";
import Modal from '@/components/warehouse/modal/Modal';
import ItemModal from './ItemModal';

export default function ShipmentItems({ vendor, shipmentDetailsData }) {
    const [shipmentDetails, setShipmentDetails] = useState(shipmentDetailsData)
    const [selectedItem, setSelectedItem] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const attributeKeys = [];
    if (shipmentDetails.items && shipmentDetails.items.length > 0) {
        shipmentDetails.items.forEach(item => {
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
    }

    return (
        <>
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link className="bg-gray-600 rounded-full p-2" href={`/warehouse/${vendor.vendor_id}/shipments`}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                    <div className="text-gray-400">
                        <span className="text-gray-100 font-medium">{vendor?.company_name}</span> {'>'} <span>Shipment #{shipmentDetails?.shipment_id}</span>
                    </div>
                </div>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md">
                    CLEAR
                </button>
            </div>

            <div className="overflow-x-auto bg-white">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-gray-600 font-semibold">IMAGE</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">PRODUCT</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">BRAND</th>
                            {/* 2. Render table headers dynamically */}
                            {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                <th className="py-3 px-4 text-gray-600 font-semibold" key={index}>{attribute.toUpperCase()}</th>
                            ))}
                            <th className="py-3 px-4 text-gray-600 font-semibold">SENT</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">R.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">F.</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">A.</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {/* // 3. Loop through shipmentDetails.items */}
                        {shipmentDetails.items && shipmentDetails.items.length > 0 && shipmentDetails.items.map((item, index) => (
                            <tr className="border-b hover:bg-gray-50" key={index} onClick={() => handleShowItem(item)}>
                                <td className="py-4 px-4">
                                    <img src={item.image} alt={item.name} className="w-12 h-12" />
                                </td>
                                <td className="py-4 px-4 flex items-center space-x-2">{item.name}
                                </td>
                                <td className="py-4 px-4">{item.brand_name}</td>

                                {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                    <td className="py-4 px-4" key={index}>{item.attributes[attribute]}</td>
                                ))}
                                <td className="py-4 px-4">{item.stock_in}</td>
                                <td className="py-4 px-4">{item.received !== null && item.received !== undefined ? item.received : '-'}</td>
                                <td className="py-4 px-4">{item.faulty !== null && item.faulty !== undefined ? item.faulty : '-'}</td>
                                <td className="py-4 px-4">
                                    {item.received !== null && item.received !== undefined && item.faulty !== null && item.faulty !== undefined
                                        ? Math.max(item.received - item.faulty, 0)
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ItemModal itemData={selectedItem} openModal={openModal} setIsModalOpen={setIsModalOpen} items={shipmentDetails.items} setShipmentDetails={setShipmentDetails} />
            </Modal >
        </>
    )
}