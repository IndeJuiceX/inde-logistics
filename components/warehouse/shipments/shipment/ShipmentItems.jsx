'use client';

import { useState } from 'react';
import Link from "next/link";
import Modal from '@/components/warehouse/modal/Modal';
import ItemModal from './ItemModal';

export default function ShipmentItems({ vendor, shipmentDetails }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log('shipmentDetails', shipmentDetails);

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
                                <td className="py-4 px-4 flex items-center space-x-2">
                                    <div className="bg-gray-700 text-white rounded-full p-2 flex items-center justify-center">
                                        <span>-</span>
                                    </div>
                                    <span>{item.name}</span>
                                </td>
                                <td className="py-4 px-4">{item.brand_name}</td>

                                {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                    <td className="py-4 px-4" key={index}>{item.attributes[attribute]}</td>
                                ))}
                                <td className="py-4 px-4">{item.quantity}</td>
                                <td className="py-4 px-4">-</td>
                                <td className="py-4 px-4">-</td>
                                <td className="py-4 px-4">-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ItemModal item={selectedItem} openModal={openModal} setIsModalOpen={setIsModalOpen} />
            </Modal >

            {/*       <h2 class="text-center text-lg font-semibold text-black mb-2">Kentucky Leaf</h2>
                <p class="text-center text-sm text-gray-500 mb-4">50ml • 0mg • 70/30</p>


                <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 bg-white border rounded-md">
                        <span class="text-red-500">Sent:</span>
                        <span class="font-semibold text-black">5</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-white border rounded-md">
                        <span class="text-black">Received:</span>
                        <span class="font-semibold text-black">5</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-white border rounded-md">
                        <span class="text-black">Faulty:</span>
                        <span class="font-semibold text-black">1</span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-white border rounded-md">
                        <span class="text-blue-500">Accepted:</span>
                        <span class="font-semibold text-black">4</span>
                    </div>
                </div>

               
                <div class="flex justify-center mt-4">
                    <img src="product-image-url.jpg" alt="Product Image" class="w-32 h-auto" />
                </div>

                <div class="flex justify-center mt-2">
                    <div class="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">
                        5056168817092
                    </div>
                </div>

               
                <div class="flex justify-between mt-6">
                    <button class="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>Previous</button>
                    <button class="bg-red-500 text-white px-4 py-2 rounded-md">Close</button>
                    <button class="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>Next</button>
                </div>



            </Modal> */}
        </>
    )
}