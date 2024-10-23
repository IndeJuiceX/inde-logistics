'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function StockShipmentDetails({ vendorId, stockShipmentId }) {

    const router = useRouter();

    const [stockShipment, setStockShipment] = useState(null);
    const [stockShipmentItems, setStockShipmentItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the shipment details from the backend API
        const fetchShipmentDetails = async () => {
            try {
                const response = await fetch(
                    `/api/v1/vendor/stock-shipments?stock_shipment_id=${stockShipmentId}`
                );
                const data = await response.json();
                console.log(data)
                if (response.ok && data.success) {
                    const {
                        stock_shipment,
                        stock_shipment_items,
                    } = data.data;

                    setStockShipment(stock_shipment);
                    setStockShipmentItems(stock_shipment_items || []);
                } else {
                    console.error('Error fetching shipment details:', data.error);
                    // Optionally, you can redirect the user or show an error message
                }
            } catch (error) {
                console.error('Error fetching shipment details:', error);
                // Handle the error (e.g., show an error message to the user)
            } finally {
                setLoading(false);
            }
        };

        if (stockShipmentId && vendorId) {
            fetchShipmentDetails();
        }
    }, [stockShipmentId, vendorId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading shipment details...</div>
            </div>
        );
    }

    if (!stockShipment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Failed to load shipment details.</div>
            </div>
        );
    }

    const { shipment_id, created_at, status } = stockShipment;

    const handleEditShipment = () => {
        router.push(`/vendor/${vendorId}/stock-shipments/${stockShipmentId}/edit`);
    };

    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Stock Shipments', url: `/vendor/${vendorId}/stock-shipments` },
        { text: `Shipment Details` },
    ];

    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Shipment Details
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Shipment ID:</span>{' '}
                                    {shipment_id}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Date Created:</span>{' '}
                                    {new Date(created_at).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Status:</span>{' '}
                                    <span
                                        className={`inline-block px-2 py-1 text-sm font-semibold rounded ${status === 'Draft'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : status === 'Submitted'
                                                ? 'bg-blue-100 text-blue-800'
                                                : status === 'Received'
                                                    ? 'bg-green-100 text-green-800'
                                                    : status === 'Shelved'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Total Items:</span>{' '}
                                    {stockShipmentItems.length}
                                </p>
                                {/* Edit Shipment Button */}
                                <button
                                    onClick={handleEditShipment}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Edit Shipment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Items</h2>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        {/* Product Column */}
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            Product
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            Brand
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            Quantity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockShipmentItems.length > 0 ? (
                                        stockShipmentItems.map((item, index) => (
                                            <tr key={index} className="border-t hover:bg-gray-50">
                                                {/* Product Cell */}
                                                <td className="px-4 py-2 text-gray-700 flex items-center space-x-4">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                            N/A
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.name || 'N/A'}</p>
                                                        <p className="text-sm text-gray-500">
                                                            SKU: {item.vendor_sku || 'N/A'}
                                                        </p>
                                                    </div>
                                                </td>
                                                {/* Brand */}
                                                <td className="px-4 py-2 text-gray-700">
                                                    {item.brand_name || 'N/A'}
                                                </td>
                                                {/* Quantity */}
                                                <td className="px-4 py-2 text-gray-700">
                                                    {item.quantity || 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="px-4 py-2 text-center text-gray-500"
                                            >
                                                No items in this shipment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}