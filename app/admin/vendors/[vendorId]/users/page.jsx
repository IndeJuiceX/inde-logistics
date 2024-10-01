'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path according to your project structure

export default function VendorUsersPage() {
  const { vendorId } = useParams(); // Get the vendorId from the URL
  const router = useRouter();
  
  const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
          }
        } catch (err) {
          console.error('Error fetching vendor name:', err);
        }
      };
      fetchVendor();
    }
  }, [vendorId]);

  // Fetch vendor users
  useEffect(() => {
    if (vendorId) {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/${vendorId}/users`);
          const data = await response.json();
          setUsers(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching users:', error);
          setError('Failed to fetch users');
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [vendorId]);

  // Handle user deletion
  const handleDelete = async (userEmail) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/v1/admin/vendor/${vendorId}/users/${encodeURIComponent(userEmail)}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('User deleted successfully');
          // Remove user from the state
          setUsers((prevUsers) => prevUsers.filter((user) => user.email !== userEmail));
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* VendorMenu Component */}
        <VendorMenu vendorId={vendorId} vendorName={vendorName} activePage="Users" />

        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Vendor Users</h1>
            <button
              onClick={() => router.push(`/admin/vendors/${vendorId}/users/create`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Create User
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center py-6 text-gray-700">Loading users...</p>
            ) : error ? (
              <p className="text-center py-6 text-red-600">{error}</p>
            ) : users.length > 0 ? (
              <table className="min-w-full table-auto text-left">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {users.map((user) => (
                    <tr key={user.email} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6">{user.user_type}</td>
                      <td className="py-3 px-6">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => router.push(`/admin/vendors/${vendorId}/users/${encodeURIComponent(user.email)}`)}
                            className="text-blue-500 hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/vendors/${vendorId}/users/${encodeURIComponent(user.email)}/edit`)
                            }
                            className="text-green-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.email)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-6 text-gray-700">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}