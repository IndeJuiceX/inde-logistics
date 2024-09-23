'use client'

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';  // You can replace this with an emoji if you want

export default function VendorDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg h-screen">
        <div className="p-6 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor Name</h2>
        </div>
        <ul className="space-y-4 mt-4">
          <li>
            <a
              href="/vendor/products"
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Products
            </a>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <a
              href="/vendor/orders"
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Orders
            </a>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <a
              href="/vendor/shipments"
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Stock Shipments
            </a>
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
            {/* You can replace this Image with a profile emoji */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
              <span role="img" aria-label="profile" className="text-2xl">👤</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              <a
                href="/vendor/profile"
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
          <p className="text-lg text-gray-600">Manage your profile, products, orders, and stock shipments.</p>

          {/* Example Content */}
          <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <p className="text-gray-700">You currently have no recent orders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

