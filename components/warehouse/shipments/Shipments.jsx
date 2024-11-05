'use client';
import { useState } from 'react';
import Modal from '@/components/warehouse/modal/Modal';
import { formatDate } from "@/services/utils/convertTime";
import { useRouter, usePathname, useParams } from 'next/navigation';
import { urlFormatter } from '@/services/utils/index';
import Link from 'next/link';

export default function Shipments({ selectedTap='shipments',vendors, stockShipments }) {
    const router = useRouter();
    const pathname = usePathname();
    const { vendor_id } = useParams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allShipments, setAllShipments] = useState(stockShipments);
    const [allVendors, setAllVendors] = useState(vendors);

    // console.log('allShipments', allShipments);

    const handleGetAllVendors = async () => {
        setIsModalOpen(true);
    }

    const loadShipments = (vendorId) => async () => {
        if (!vendorId) {
            return;
        }
        const newPath = urlFormatter(pathname, vendorId);
        router.push(newPath);
        setIsModalOpen(false);
    }
    const findVendor = (vendorId) => {
        const vendor = allVendors.find(vendor => vendor.vendor_id === vendorId);
        return vendor ? vendor.company_name : 'All Vendors';
    }
    return (
        <div>
            <div className="flex items-center bg-gray-800 p-4 rounded-md mb-4">
                <span onClick={handleGetAllVendors} className="w-100 bg-gray-700 text-white px-4 py-2 rounded-md outline-none">
                    {findVendor(vendor_id)}</span>
                <span className="flex-grow"></span>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ul>
                    <li className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200" onClick={loadShipments('all')}>All Vendors</li>

                    {allVendors.length > 0 ? allVendors.map((vendor, index) => (
                        <li key={index} className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200" onClick={loadShipments(vendor.vendor_id)}>
                            <span>{vendor.company_name}</span>
                            {/* <span className="text-sm text-gray-500">{vendor.location}</span> */}
                        </li>
                    )) : <li className="text-gray-600">No vendors found</li>}
                </ul>
            </Modal>
            <div className="space-y-2 overflow-y-auto ">

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

                                    <tr 
                                        className="border-b border-gray-200 hover:bg-gray-100" 
                                        key={index} 
                                        onClick={() => window.location.href = `${selectedTap}/${shipment.shipment_id}`}>
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
                                            <Link className="text-gray-500 hover:text-gray-700" href={`shipments/${shipment.shipment_id}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M10 17l5-5-5-5v10z" />
                                                </svg>
                                            </Link>
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