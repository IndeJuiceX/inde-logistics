'use client'

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false); // Track submenu state

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg h-screen">
        <div className="p-6 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
        </div>
        <ul className="space-y-4 mt-4">
          <li>
            <div
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition cursor-pointer"
              onClick={() => setSubmenuOpen(!submenuOpen)} // Toggle submenu
            >
              Vendors
            </div>
            {/* Submenu for Vendors */}
            {submenuOpen && (
              <ul className="pl-4 space-y-2">
                <li>
                  <a
                    href="/admin/add-user"
                    className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
                  >
                    Add User
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/deactivate-vendor"
                    className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
                  >
                    Deactivate Vendor
                  </a>
                </li>
              </ul>
            )}
            <hr className="border-t border-gray-200" />
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {/* Profile avatar at the top-right corner */}
        <div className="absolute top-4 right-4">
          <div
            className="relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Profile avatar or emoji */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
              <span role="img" aria-label="profile" className="text-2xl">👤</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              <a
                href="/admin/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition"
              >
                Profile
              </a>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard</h1>
          <p className="text-lg text-gray-600">Manage vendors, users, and system settings.</p>

          {/* Example Content */}
          <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <p className="text-gray-700">Here, you can view and manage vendors and users.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
