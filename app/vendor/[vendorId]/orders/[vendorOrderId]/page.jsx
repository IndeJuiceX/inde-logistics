'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function OrderDetailsPage() {
  const { vendorId,vendorOrderId } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [updatingBuyer, setUpdatingBuyer] = useState(false);

  useEffect(() => {
    // Fetch the order details from the backend API
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/v1/vendor/order/${vendorOrderId}?vendorId=${vendorId}`);
        const data = await response.json();
        console.log(data)
        if (response.ok && data.success) {
          const { order_details, order_items, buyer } = data.data;

          setOrder(order_details);
          setOrderItems(order_items || []);
          setBuyerInfo(buyer || {});
        } else {
          console.error('Error fetching order details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorOrderId) {
      fetchOrderDetails();
    }
  }, [vendorOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Failed to load order details.</div>
      </div>
    );
  }

  const { order_id, created_at, status } = order;

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
      const response = await fetch('/order/update-buyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendor_order_id: vendorOrderId, buyer: buyerInfo }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Buyer information updated successfully.');
      } else {
        console.error('Error updating buyer information:', data.error);
        alert('Failed to update buyer information.');
      }
    } catch (error) {
      console.error('Error updating buyer information:', error);
      alert('An error occurred while updating buyer information.');
    } finally {
      setUpdatingBuyer(false);
    }
  };

  return (
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
                <span className="font-semibold">Order ID:</span> {order_id}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Date Created:</span>{' '}
                {new Date(created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 text-sm font-semibold rounded ${
                    status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : status === 'Confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : status === 'Shipped'
                      ? 'bg-green-100 text-green-800'
                      : status === 'Delivered'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status}
                </span>
              </p>
            </div>
            {/* Right Column */}
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Total Items:</span>{' '}
                {orderItems.length}
              </p>
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={buyerInfo.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                rows="4"
              ></textarea>
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
                  {/* Product Column */}
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
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
                          <p className="font-medium">
                            {item.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {item.sku || 'N/A'}
                          </p>
                        </div>
                      </td>
                      {/* Quantity */}
                      <td className="px-4 py-2 text-gray-700">
                        {item.quantity || 0}
                      </td>
                      {/* Price */}
                      <td className="px-4 py-2 text-gray-700">
                        ${item.price?.toFixed(2) || '0.00'}
                      </td>
                      {/* Total */}
                      <td className="px-4 py-2 text-gray-700">
                        $
                        {(
                          (item.price || 0) * (item.quantity || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
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
  );
}