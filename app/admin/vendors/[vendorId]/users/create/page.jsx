'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path according to your project structure

export default function CreateVendorUserPage() {
  const { vendorId } = useParams();
  const router = useRouter();

  const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    userType: 'vendor_user', // Set default user type
    vendorId: vendorId, // Set vendorId from context
  });
  const [error, setError] = useState('');

  // Fetch vendor name
  useEffect(() => {
    if (vendorId) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/${vendorId}`);
          const data = await response.json();

          if (response.ok) {
            setVendorName(data.company_name || 'Vendor');
          } else {
            console.error('Failed to fetch vendor name');
            setVendorName('Vendor');
          }
        } catch (err) {
          console.error('Error fetching vendor name:', err);
        }
      };
      fetchVendor();
    }
  }, [vendorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure vendorId is included in formData
    const userData = { ...formData, vendorId };

    try {
      const res = await fetch(`/api/v1/admin/vendor/${vendorId}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('User registered successfully');
        router.push(`/admin/vendors/${vendorId}/users`); // Redirect to the vendor's users page
      } else {
        alert(data.error || 'Error registering user');
        setError(data.error || 'Error registering user');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Server error');
      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* VendorMenu Component */}
        <VendorMenu vendorId={vendorId} vendorName={vendorName} activePage="Users" />

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Create New User
          </h2>
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}