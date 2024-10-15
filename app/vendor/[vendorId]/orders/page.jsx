
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Import the PaginationControls component
import PaginationControls from '@/components/PaginationControls'; // Adjust the import path as needed

export default function OrdersPage() {
    const router = useRouter()
    const { vendorId } = useParams();

  // Dummy data for orders
  const dummyOrders = [
    {
      id: 'ORD-1001',
      created_at: '2023-10-01T10:00:00Z',
      updated_at: '2023-10-02T12:00:00Z',
      status: 'Pending',
      buyer: {
        name: 'John Doe',
        address: '123 Main St, Anytown, USA',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@example.com',
      },
      items: [
        {
          vendor_sku: 'SKU-001',
          quantity: 2,
          sales_value: 50.0,
        },
        {
          vendor_sku: 'SKU-002',
          quantity: 1,
          sales_value: 30.0,
        },
      ],
    },
    {
      id: 'ORD-1002',
      created_at: '2023-10-05T14:30:00Z',
      updated_at: '2023-10-05T15:00:00Z',
      status: 'Completed',
      buyer: {
        name: 'Jane Smith',
        address: '456 Oak Ave, Othertown, USA',
        phone: '+1 (555) 987-6543',
        email: 'jane.smith@example.com',
      },
      items: [
        {
          vendor_sku: 'SKU-003',
          quantity: 1,
          sales_value: 20.0,
        },
      ],
    },
    // Add more dummy orders as needed
  ];

  // State variables for pagination
  const [page, setPage] = useState(1);
  const pageSize = 20; // Fixed page size
  const totalResults = dummyOrders.length;
  const totalPages = Math.ceil(totalResults / pageSize);

  // Calculate the orders to display on the current page
  const displayedOrders = dummyOrders.slice((page - 1) * pageSize, page * pageSize);

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
              {displayedOrders.length > 0 ? (
                displayedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.buyer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'Completed'
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
                        {order.status === 'Pending' && (
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

        {/* Pagination Controls */}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalResults={totalResults}
        />
      </div>
    </div>
  );
}