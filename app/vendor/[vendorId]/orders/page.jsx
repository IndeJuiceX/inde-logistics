
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Import the PaginationControls component
import PaginationControls from '@/components/PaginationControls'; // Adjust the import path as needed

export default function OrdersPage() {
  const router = useRouter()
  const { vendorId } = useParams();
  const [orders, setOrders] = useState([]);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null)

  // State variables for pagination
  const pageSize = 25; // Fixed page size

  const fetchOrders = async (startKey = null) => {
    try {
      console.log('Fetching orders with startKey:', startKey);

      let url = `/api/v1/vendor/order/all?vendorId=${vendorId}&pageSize=${pageSize}`;
      if (startKey) {
        url += `&lastEvaluatedKey=${encodeURIComponent(startKey)}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await response.json();

      setOrders((prevOrders) => {
        const newOrders = data.data.filter((newOrder) =>
          !prevOrders.some((prevOrder) => prevOrder.order_id === newOrder.order_id)
        );
        return [...prevOrders, ...newOrders];
      });

      // Update the lastEvaluatedKey
      setLastEvaluatedKey(data.lastEvaluatedKey);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (vendorId) {
      // Clear previous orders and lastEvaluatedKey when vendorId changes
      setOrders([]);
      setLastEvaluatedKey(null);

      // Fetch the first page of orders
      fetchOrders();
    }
  }, [vendorId]);

  // Event handlers (implement navigation or actions as needed)
  const handleViewOrder = (orderId) => {
    // Implement view order functionality
    console.log(`View Order ${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    // Implement edit order functionality
    console.log(`Edit Order ${orderId}`);
  };

  const handleCreateOrder = () => {
    // Implement create order functionality
    router.push(`/vendor/${vendorId}/orders/create`);
  };

  const handleLoadMore = () => {
    fetchOrders(lastEvaluatedKey);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <button
            onClick={handleCreateOrder}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create New Order
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer Name
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.vendor_order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.buyer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Accepted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'Dispatched'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* View button */}
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>

                        {/* Edit button only if order is Pending */}
                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => handleEditOrder(order.id)}
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
                    colSpan="5"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {lastEvaluatedKey && (
          <button onClick={handleLoadMore} className="load-more-button">
            Load More
          </button>
        )}


      </div>
    </div>
  );
}