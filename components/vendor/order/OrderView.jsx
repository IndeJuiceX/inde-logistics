'use client';

import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import { formatDate } from '@/services/utils/convertTime';
import { useState } from 'react';


export default function OrderView({ vendorId, vendorOrderId, orderData }) {

    

    const [order, setOrder] = useState(orderData ? orderData[0] : null);
    const [orderItems, setOrderItems] = useState([]);
    const [buyerInfo, setBuyerInfo] = useState({
        name: order?.buyer?.name || '',
        phone: order?.buyer?.phone || '',
        email: order?.buyer?.email || '',
        address_line_1: order?.buyer?.address_line_1 || '',
        address_line_2: order?.buyer?.address_line_2 || '',
        address_line_3: order?.buyer?.address_line_3 || '',
        address_line_4: order?.buyer?.address_line_4 || '',
        city: order?.buyer?.city || '',
        postcode: order?.buyer?.postcode || '',
        country_code: order?.buyer?.country_code || '',
    });
    const [updatingBuyer, setUpdatingBuyer] = useState(false);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBuyerInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveBuyerInfo = async () => {
        setUpdatingBuyer(true);
        try {
            const response = await fetch(`/api/v1/vendor/orders/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendor_order_id: vendorOrderId,
                    buyer: buyerInfo,
                }),
            });

            const data = await response.json();
            if (data.updated) {
                alert('Buyer information updated successfully.');
            }

        } catch (error) {
            console.error('Error updating buyer information:', error);
            alert('An error occurred while updating buyer information.');
        } finally {
            setUpdatingBuyer(false);
        }
    };

    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Orders', url: `/vendor/${vendorId}/orders` },
        { text: 'Order Details' }
    ];
    const totalItems = order?.items.reduce((acc, item) => acc + item.quantity, 0);
    const dateCreated = order?.created_at ? formatDate(order.created_at, 'number') : null;
    const expected_delivery_date = order?.expected_delivery_date ? order.expected_delivery_date : null;


    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Order Details Header */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Order Details
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Order ID:</span> {order?.vendor_order_id}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Date Created:</span>{' '}
                                    {dateCreated ? dateCreated : 'N/A'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">
                                        Expected Delivery Date:
                                    </span>{' '}
                                    {expected_delivery_date ? expected_delivery_date : 'N/A'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Status:</span>{' '}
                                    <span
                                        className={`inline-block px-2 py-1 text-sm font-semibold rounded ${order?.status === 'Accepted'
                                            ? 'bg-green-100 text-green-800'
                                            : order?.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order?.status === 'Confirmed'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : order?.status === 'Shipped'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {order?.status}
                                    </span>
                                </p>
                            </div>
                            {/* Right Column */}
                            <div>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Total Items:</span>{' '}
                                    {totalItems || 0}
                                </p>
                                {/*} <p className="text-gray-600">
                                    <span className="font-semibold">Shipping Cost:</span>{' '}
                                    £{shipping_cost?.toFixed(2) || '0.00'}
                                </p>*/}
                                {/* Additional order details can go here */}
                            </div>
                        </div>
                    </div>

                    {/* Buyer Information */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Buyer Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={buyerInfo.name || ''}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700"
                                    readOnly
                                />
                            </div>
                            {/* Phone */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={buyerInfo.phone || ''}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700"
                                    readOnly
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={buyerInfo.email || ''}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700"
                                    readOnly
                                />
                            </div>
                            {/* Address Line 1 */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    name="address_line_1"
                                    value={buyerInfo.address_line_1 || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                    required
                                />
                            </div>
                            {/* Address Line 2 */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="address_line_2"
                                    value={buyerInfo.address_line_2 || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                />
                            </div>
                            {/* Address Line 3 */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Address Line 3
                                </label>
                                <input
                                    type="text"
                                    name="address_line_3"
                                    value={buyerInfo.address_line_3 || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                />
                            </div>
                            {/* Address Line 4 */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Address Line 4
                                </label>
                                <input
                                    type="text"
                                    name="address_line_4"
                                    value={buyerInfo.address_line_4 || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                />
                            </div>
                            {/* City */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={buyerInfo.city || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                    required
                                />
                            </div>
                            {/* Postcode */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Postcode
                                </label>
                                <input
                                    type="text"
                                    name="postcode"
                                    value={buyerInfo.postcode || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                    required
                                />
                            </div>
                            {/* Country */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Country Code
                                </label>
                                <input
                                    type="text"
                                    name="country_code"
                                    value={buyerInfo.country_code || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                    required
                                />
                            </div>
                        </div>
                        {/* Save Button */}
                        <button
                            onClick={handleSaveBuyerInfo}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            disabled={updatingBuyer}
                        >
                            {updatingBuyer ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Items</h2>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        {/* SKU */}
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            SKU
                                        </th>
                                        {/* Quantity */}
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            Quantity
                                        </th>
                                        {/* Price */}
                                        <th className="px-4 py-2 text-left text-gray-600 font-medium">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <tr key={index} className="border-t hover:bg-gray-50">
                                                {/* SKU */}
                                                <td className="px-4 py-2 text-gray-700">
                                                    {item.vendor_sku || 'N/A'}
                                                </td>
                                                {/* Quantity */}
                                                <td className="px-4 py-2 text-gray-700">
                                                    {item.quantity || 0}
                                                </td>
                                                {/* Price */}
                                                <td className="px-4 py-2 text-gray-700">
                                                    £{item.sales_value?.toFixed(2) || '0.00'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="px-4 py-2 text-center text-gray-500"
                                            >
                                                No items in this order.
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