'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function StockShipmentsPage() {
  const { vendorId } = useParams(); // Simulating vendorId from the route
  const router = useRouter();

  // Dummy stock shipment data
  const [shipments, setShipments] = useState([
    {
      shipment_id: 'SHIP123456',
      created_at: '2024-09-25T10:45:00Z',
      total_items: 10,
      status: 'Draft',
    },
    {
      shipment_id: 'SHIP123457',
      created_at: '2024-09-20T12:30:00Z',
      total_items: 25,
      status: 'Submitted',
    },
    {
      shipment_id: 'SHIP123458',
      created_at: '2024-09-18T14:15:00Z',
      total_items: 5,
      status: 'Received',
    },
    {
      shipment_id: 'SHIP123459',
      created_at: '2024-09-15T09:10:00Z',
      total_items: 15,
      status: 'Shelved',
    },
    {
      shipment_id: 'SHIP123460',
      created_at: '2024-09-10T08:45:00Z',
      total_items: 40,
      status: 'Submitted',
    },
  ]);

  const handleViewShipment = (shipmentId) => {
    // Simulate redirection to a shipment details page
    router.push(`/vendor/${vendorId}/stock-shipment/${shipmentId}`);
  };

  const handleEditShipment = (shipmentId) => {
    // Simulate redirection to an edit page
    router.push(`/vendor/${vendorId}/stock-shipment/${shipmentId}/edit`);
  };

  const handleCreateShipment = () => {
    // Simulate redirection to create a new stock shipment
    router.push(`/vendor/${vendorId}/stock-shipments/create`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Stock Shipments</h1>
          <button
            onClick={handleCreateShipment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create New
          </button>
        </div>

        {/* Table for stock shipments */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.shipment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.shipment_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(shipment.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.total_items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      shipment.status === 'Draft' ? 'bg-yellow-100 text-yellow-800'
                        : shipment.status === 'Submitted' ? 'bg-blue-100 text-blue-800'
                        : shipment.status === 'Received' ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
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
                      {shipment.status === 'Draft' && (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
