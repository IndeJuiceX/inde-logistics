'use client'

import { useState, useEffect } from 'react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/v1/admin/vendors'); // Update with actual API route
        const data = await response.json();
        setVendors(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
          <a
            href="/admin/vendors/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Add Vendor
          </a>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <p className="text-center py-6 text-gray-700">Loading vendors...</p>
          ) : vendors.length > 0 ? (
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6">Company Name</th>
                  <th className="py-3 px-6">Company Number</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {vendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{vendor.company_name}</td>
                    <td className="py-3 px-6">{vendor.company_number}</td>
                    <td className="py-3 px-6">{vendor.phone}</td>
                    <td className="py-3 px-6">{vendor.email}</td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-4">
                        <a href={`/admin/vendors/${vendor.vendor_id}`} className="text-blue-500 hover:underline">View</a>
                        <a href={`/admin/vendors/${vendor.vendor_id}/edit`} className="text-green-500 hover:underline">Edit</a>
                        <button className="text-red-500 hover:underline" onClick={() => handleDelete(vendor.vendor_id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-6 text-gray-700">No vendors found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Dummy function for handling vendor deletion (replace with actual logic)
const handleDelete = (vendorId) => {
  if (confirm('Are you sure you want to delete this vendor?')) {
    // Call delete API and refetch vendors
  }
};
