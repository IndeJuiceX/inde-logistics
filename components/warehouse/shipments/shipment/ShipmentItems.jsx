'use client';

import { useState } from 'react';

import Modal from '@/components/warehouse/modal/Modal';
import ItemModal from '@/components/warehouse/shipments/shipment/ItemModal';
import ShipmentHeader from '@/components/warehouse/ShipmentHeader';

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
            <ShipmentHeader vendor={vendor} shipmentDetails={shipmentDetails} />

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