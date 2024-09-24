'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';


export default function VendorDetails() {
    const [vendorData, setVendorData] = useState({});
    const { vendorId } = useParams();  // Get the vendor ID from the URL
    //const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch vendor details from the API when the component loads
        const fetchVendor = async () => {
            try {
                const response = await fetch(`/api/v1/admin/vendor/${vendorId}`);
                const data = await response.json();
                console.log(data)
                if (response.ok) {
                    setVendor(data);
                } else {
                    setError(data.error || 'Failed to fetch vendor details');
                }
            } catch (err) {
                setError('An error occurred while fetching vendor details');
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchVendor();
        }
    }, [vendorId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }
    const handleStatusChange = (newStatus) => {
        setVendorData({ ...vendorData, status: newStatus });
        // You can call an API to update the status in the backend here
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                {/* Horizontal Menu */}
                <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-3 rounded-t-lg shadow">
                    <div className="flex space-x-6">
                        <Link href={`/admin/vendors/${vendorData.vendorId}/products`} className="text-white hover:text-blue-400">
                            Products
                        </Link>
                        <Link href={`/admin/vendors/${vendorData.vendorId}/orders`} className="text-white hover:text-blue-400">
                            Orders
                        </Link>
                        <Link href={`/admin/vendors/${vendorData.vendorId}/shipments`} className="text-white hover:text-blue-400">
                            Stock Shipments
                        </Link>
                        <Link href={`/admin/vendors/${vendorData.vendorId}/users`} className="text-white hover:text-blue-400">
                            Users
                        </Link>
                    </div>
                </div>

                {/* Vendor Details Card */}
                <div className="bg-white shadow-md rounded-lg p-8 mt-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Vendor Details: {vendorData.company_name}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-700">
                                <strong>Company Name:</strong> {vendorData.company_name}
                            </p>
                            <p className="text-gray-700">
                                <strong>Company Number:</strong> {vendorData.company_number}
                            </p>
                            <p className="text-gray-700">
                                <strong>Email:</strong> {vendorData.email}
                            </p>
                            <p className="text-gray-700">
                                <strong>Phone:</strong> {vendorData.phone}
                            </p>
                            <p className="text-gray-700">
                                <strong>Shipping Code:</strong> {vendorData.shipping_code}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-700">
                                <strong>Status:</strong> {vendorData.status}
                            </p>
                            <select
                                className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={vendorData.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Edit Details */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Edit Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={vendorData.email}
                                    onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={vendorData.phone}
                                    onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
