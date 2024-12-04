'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu';
import { updateVendor, getVendorById } from '@/services/data/vendor';
import { PencilIcon } from '@heroicons/react/24/solid'; // Import the edit icon

export default function VendorDetails({ vendorDataFromSever }) {
  const { vendorId } = useParams(); // Get the vendor ID from the URL
  const [vendor, setVendor] = useState(vendorDataFromSever);
  const [vendorData, setVendorData] = useState(vendorDataFromSever);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false); // For copy status

  // State variables for editing the courier field
  const [isEditingCourier, setIsEditingCourier] = useState(false);
  const [editedCourierValue, setEditedCourierValue] = useState(vendor.courier);

  useEffect(() => {
    // Update the editedCourierValue when vendor.courier changes
    setEditedCourierValue(vendor.courier);
  }, [vendor.courier]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  const handleStatusChange = async (newStatus) => {
    const message = `Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} ${vendor?.company_name}?`;
    const confirmChange = window.confirm(message);
    if (confirmChange) {
      setVendorData({ ...vendorData, status: newStatus });

      const response = await updateVendor(vendorId, { status: newStatus });
      if (response.success) {
        const getVendor = await getVendorById(vendorId);
        if (getVendor.success) {
          setVendor(getVendor.data);
        } else {
          console.error('Error fetching vendor:', getVendor.error);
        }
      } else {
        console.error('Error toggling vendor status:', response.error);
      }
    }
  };

  // Function to handle courier update
  const handleCourierUpdate = async () => {
    const updatedCourier = editedCourierValue.toLowerCase();

    const response = await updateVendor(vendorId, { courier: updatedCourier });
    if (response.success) {
      // Update the vendor state
      setVendor({ ...vendor, courier: updatedCourier });
      setIsEditingCourier(false);
    } else {
      console.error('Error updating courier:', response.error);
      // Optionally, show an error message to the user
    }
  };

  // Copy API Key to Clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Use the VendorMenu Component */}
        <VendorMenu vendorId={vendorId} vendorName={vendor?.company_name || 'Vendor'} />

        {/* Vendor Details Card */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Vendor Details: {vendor.company_name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Info */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <strong>Company Name:</strong> {vendor.company_name}
                </p>
                <p className="text-gray-700">
                  <strong>Company Number:</strong> {vendor.company_number}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {vendor.email}
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> {vendor.phone}
                </p>
                <p className="text-gray-700 flex items-center">
                  <strong>Courier:</strong>
                  {isEditingCourier ? (
                    <>
                      <input
                        type="text"
                        className="ml-2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editedCourierValue}
                        onChange={(e) => setEditedCourierValue(e.target.value)}
                      />
                      <button
                        className="ml-2 text-green-500 hover:text-green-700"
                        onClick={handleCourierUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setIsEditingCourier(false);
                          setEditedCourierValue(vendor.courier);
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="ml-2">{vendor.courier}</span>
                      <button
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        onClick={() => setIsEditingCourier(true)}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Status and Edit Options */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <strong>Status:</strong> {vendor.status}
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

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Edit Vendor Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={vendorData.email}
                      onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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

          {/* API Key Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">API Key</h3>
            <div className="flex items-center">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={vendor.api_key}
                readOnly
              />
              <button
                onClick={() => copyToClipboard(vendor.api_key)}
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
