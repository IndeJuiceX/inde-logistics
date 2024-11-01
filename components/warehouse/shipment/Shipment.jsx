'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/warehouse/modal/Modal';
import { getDateAndTime, formatDate } from "@/services/utils/convertTime";
import { useRouter, useSearchParams } from 'next/navigation';

export default function Shipment({ vendors }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allShipments, setAllShipments] = useState([]);
    const [allVendors, setAllVendors] = useState(vendors);

    const handleGetAllVendors = async () => {
        console.log('All Vendors');
        setIsModalOpen(true);
    }

    const loadShipments = (vendorId) => async () => {
        console.log('Load Shipments', vendorId);
        if (!vendorId) {
            return;
        }
        router.push('?vendor_id=' + vendorId);
        setIsModalOpen(false);
    }

    const fetchShipments = async (vendorId) => {
        const response = await fetch(`/api/v1/vendor/stock-shipments?vendor_id=${vendorId}`);
        if (!response.ok) {
            console.log('Failed to fetch shipments');
            return [];
        }
        const shipments = await response.json();
        console.log('Shipments', shipments);
        if (shipments.error) {
            console.log('Error', shipments.error);
        }
        if (shipments.success) {
            setAllShipments(shipments.data);
        }
    }
    useEffect(() => {
        const venderId = searchParams.get('vendor_id');
        if (venderId) {
            fetchShipments(venderId);
        }
    }, [searchParams]);

    return (
        <div>
            <div className="flex items-center bg-gray-800 p-4 rounded-md mb-4">
                <span onClick={handleGetAllVendors} className="w-100 bg-gray-700 text-white px-4 py-2 rounded-md outline-none">
                    All Vendors</span>
                <span className="flex-grow"></span>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ul>
                    <li className="pb-3 text-gray-600 font-semibold text-lg">All Vendors</li>
                    {allVendors.length > 0 ? allVendors.map((vendor, index) => (
                        <li key={index} className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                            <span onClick={loadShipments(vendor.vendor_id)} >{vendor.company_name}</span>
                            {/* <span className="text-sm text-gray-500">{vendor.location}</span> */}
                        </li>
                    )) : <li className="text-gray-600">No vendors found</li>}
                </ul>
            </Modal>
            <div className="space-y-2 overflow-y-auto h-96">
                
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-100">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left font-semibold">Shipment</th>
                                <th className="py-3 px-6 text-left font-semibold">Create Date</th>
                                <th className="py-3 px-6 text-center font-semibold">SKUs</th>
                                {/* <th className="py-3 px-6 text-center font-semibold">Total</th> */}
                                <th className="py-3 px-6 text-center font-semibold">Received</th>
                                <th className="py-3 px-6 text-center font-semibold">Missing</th>
                                <th className="py-3 px-6 text-center font-semibold">Faulty</th>
                                <th className="py-3 px-6 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-medium">
                            {allShipments.length > 0 ? (
                                allShipments.map((shipment, index) => (
                                    <tr className="border-b border-gray-200 hover:bg-gray-100" key={index}>
                                        <td className="py-3 px-6 text-left">
                                            <span className="text-orange-500 font-bold">#{shipment.shipment_id}</span>
                                        </td>
                                        <td className="py-3 px-6 text-left">{formatDate(shipment.created_at)}</td>
                                        <td className="py-3 px-6 text-center">{shipment.items ? shipment.items.length : 0}</td>
                                        {/* <td className="py-3 px-6 text-center">537</td> */}
                                        <td className="py-3 px-6 text-center">-</td>
                                        <td className="py-3 px-6 text-center">-</td>
                                        <td className="py-3 px-6 text-center">-</td>
                                        <td className="py-3 px-6 text-center">
                                            <button className="text-gray-500 hover:text-gray-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M10 17l5-5-5-5v10z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left">No shipments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}