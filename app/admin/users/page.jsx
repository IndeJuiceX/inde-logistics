'use client'

import { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch system users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/system-users');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">System Users</h1>
          <a
            href="/admin/system-users/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Create User
          </a>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <p className="text-center py-6 text-gray-700">Loading users...</p>
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
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{user.first_name} {user.last_name}</td>
                    <td className="py-3 px-6">{user.email}</td>
                    <td className="py-3 px-6">{user.role}</td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-4">
                        <a href={`/admin/system-users/${user.id}`} className="text-blue-500 hover:underline">View</a>
                        <a href={`/admin/system-users/${user.id}/edit`} className="text-green-500 hover:underline">Edit</a>
                        <button className="text-red-500 hover:underline" onClick={() => handleDelete(user.id)}>
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
  );
}

// Dummy function for handling user deletion (replace with actual logic)
const handleDelete = (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    console.log('User deleted:', userId);
    // Call delete API and refetch users
  }
};

