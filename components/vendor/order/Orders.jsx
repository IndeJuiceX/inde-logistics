'use client';

import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import Link from 'next/link';

export default function Orders({ vendorId }) {
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

    const pageSize = 25; // Fixed page size

    const fetchOrders = async (startKey = null) => {
        try {
            setLoading(true);
            console.log('Fetching orders with startKey:', startKey);
            let url = `/api/v1/vendor/orders?page_size=${pageSize}`;
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

            setLastEvaluatedKey(data.lastEvaluatedKey);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    useEffect(() => {
        if (vendorId) {
            setOrders([]);
            setLastEvaluatedKey(null);
            fetchOrders();
        }
    }, [vendorId]);

    const handleCancelOrder = async (vendor_order_id) => {
        const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
        if (confirmCancel) {
            try {
                const response = await fetch(`/api/v1/vendor/orders/cancel`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ vendor_order_id }),
                });

                if (response.ok) {
                    // After successful cancellation, update the order status locally
                    setOrders((prevOrders) =>
                        prevOrders.map((order) =>
                            order.vendor_order_id === vendor_order_id ? { ...order, status: 'Cancelled' } : order
                        )
                    );
                    alert('Order cancelled successfully');
                } else {
                    alert('Failed to cancel the order');
                }
            } catch (err) {
                console.error('Error cancelling order:', err);
                alert('An error occurred while cancelling the order');
            }
        }
    };

    const handleLoadMore = () => {
        fetchOrders(lastEvaluatedKey);
    };
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Orders' }
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                        <Link className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" href={`/vendor/${vendorId}/orders/create`}>Create New Order</Link>
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
                                {loading &&
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                        >
                                            Loading ......
                                        </td>
                                    </tr>
                                }

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
                                                    <Link className="text-blue-600 hover:text-blue-900" href={`/vendor/${vendorId}/orders/${order.vendor_order_id}`}>View </Link>

                                                    {order.status === 'Accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleCancelOrder(order.vendor_order_id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    !loading && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                            >
                                                No orders found.
                                            </td>
                                        </tr>
                                    )
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
        </>
    );
}
