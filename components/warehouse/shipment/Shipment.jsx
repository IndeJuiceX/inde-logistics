'use client';
import { useState } from 'react';
import Modal from '@/components/warehouse/modal/Modal';
import { customFetch } from '@/services/utils';

export default function Shipment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allShipments, setAllShipments] = useState([]);

    const handleGetAllVendors = async () => {
        console.log('All Vendors');
        const response = await customFetch('api/v1/admin/vendors');
        if (!response.ok) {
            console.log('Failed to fetch shipments');
            return [];
        }
        const shipments = await response.json();
        setAllShipments(shipments);
        setIsModalOpen(true);
    }


    return (
        <div>
            <div className="flex items-center bg-gray-800 p-4 rounded-md mb-4">
                <span onClick={handleGetAllVendors} className="w-100 bg-gray-700 text-white px-4 py-2 rounded-md outline-none">
                    All Vendors</span>
                <span className="flex-grow"></span>
            </div>
            {/* <h1>Shipment Page</h1>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => setIsModalOpen(true)}
            /> */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ul>
                    <li className="pb-3 text-gray-600 font-semibold text-lg">All Vendors</li>
                    // Loop through all vendors before loop check if there are any vendors
                    {allShipments.length > 0 ? allShipments.map((shipment) => (
                        <li className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                            <span>{shipment.name}</span>
                            <span className="text-sm text-gray-500">{shipment.location}</span>
                        </li>
                    )) : <li className="text-gray-600">No vendors found</li>}
                    {/* 

                    <li className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>04 Liquids</span>
                        <span className="text-sm text-gray-500">VAPERBAR CHEL...</span>
                    </li> */}

                </ul>
            </Modal>
        </div>
    )
}