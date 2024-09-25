'use client';

import { useState } from 'react';
//import { signOut } from 'next-auth/react';
import Link from 'next/link'; // Use Link for better navigation
import { doLogOut } from '@/app/actions';
export default function VendorLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    //await ({ callbackUrl: '/login' });
    await doLogOut();
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
            <Link href="/vendor/products" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Products
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link href="/vendor/orders" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Orders
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link href="/vendor/shipments" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Stock Shipments
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 relative">
        {/* Profile Button */}
        <div className="absolute top-4 right-4">
          <div className="relative" onClick={() => setIsOpen(!isOpen)}>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
              <span role="img" aria-label="profile" className="text-2xl">👤</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              <Link href="/vendor/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Page-specific Content */}
        {children}
      </div>
    </div>
  );
}
