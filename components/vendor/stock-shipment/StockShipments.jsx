'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Import the PaginationControls component
import PaginationControls from '@/components/PaginationControls'; // Adjust the import path as needed
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import Link from 'next/link';

export default function StockShipments({ vendorId }) {
    //   const { vendorId } = useParams();
    const router = useRouter();

    // State variables
    const [shipments, setShipments] = useState([]);
    const [page, setPage] = useState(1); // Renamed currentPage to page for consistency
    const [pageSize] = useState(20); // Assuming a fixed page size of 20
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (vendorId) {
            const fetchStockShipments = async () => {
                try {
                    const response = await fetch(
                        `/api/v1/vendor/stock-shipments?page=${page}&page_size=${pageSize}`
                    );
                    const data = await response.json();
                    // console.log('API Response:', data);

                    if (data.success) {
                        setShipments(data.data);

                        // Calculate total pages based on total items and page size
                        const totalItems = data.data.length;
                        setTotalResults(totalItems);
                        setTotalPages(Math.ceil(totalItems / pageSize));
                    } else {
                        console.error('Error fetching stock shipments:', data.error);
                    }
                } catch (error) {
                    console.error('Error fetching stock shipments:', error);
                }
            };
            fetchStockShipments();
        }
    }, [vendorId, page, pageSize]);

    const handleViewShipment = (shipmentId) => {
        router.push(`/vendor/${vendorId}/stock-shipments/${shipmentId}`);
    };

    const handleEditShipment = (shipmentId) => {
        router.push(`/vendor/${vendorId}/stock-shipments/${shipmentId}/edit`);
    };

    // Breadcrumbs
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Stock Shipments', url: `/vendor/${vendorId}/stock-shipments` }
    ];

    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Stock Shipments</h1>
                        <Link href={`/vendor/${vendorId}/stock-shipments/create`} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600' >
                            Create New
                        </Link>
                    </div>

                    {/* Shipments Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Shipment ID
                                    </th>
                                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created Date
                                    </th>
                                    {/* Remove Total Items column if not provided by backend */}
                                    {/* <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Items
                </th> */}
                                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.length > 0 ? (
                                    shipments.map((shipment) => (
                                        <tr key={shipment.shipment_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {shipment.shipment_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(shipment.created_at).toLocaleDateString()}
                                            </td>
                                            {/* Remove Total Items column if not provided by backend */}
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.total_items || 'N/A'}
                    </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shipment.status === 'Draft'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : shipment.status === 'Submitted'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : shipment.status === 'Received'
                                                                ? 'bg-green-100 text-green-800'
                                                                : shipment.status === 'Shelved'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {shipment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {/* View button always visible */}
                                                    <button
                                                        onClick={() => handleViewShipment(shipment.shipment_id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Edit button only visible if status is Draft */}
                                                    {shipment.status === 'Submitted' && (
                                                        <button
                                                            onClick={() => handleEditShipment(shipment.shipment_id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                        >
                                            No shipments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        setPage={setPage}
                        totalResults={totalResults}
                    />
                </div>
            </div>
        </>
    );
}
