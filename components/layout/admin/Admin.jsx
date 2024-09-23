'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/router to get the current path
import { signOut } from 'next-auth/react'; // Assuming you're using NextAuth

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Toggle the dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="py-6 px-4 bg-gray-900">
          <h2 className="text-2xl font-bold text-center">Admin</h2>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/vendors"
                className={`block px-4 py-2 rounded ${
                  router.pathname === '/admin/vendors'
                    ? 'bg-gray-700 text-blue-300'
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                Vendors
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`block px-4 py-2 rounded ${
                  router.pathname === '/admin/users'
                    ? 'bg-gray-700 text-blue-300'
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                System Users
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow p-4">
          <h1 className="text-3xl font-bold"></h1>

          {/* Profile and Sign Out Button */}
          <div className="relative">
            <div className="flex items-center space-x-4">
              {/* Profile Icon */}
              <div
                className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center cursor-pointer"
                onClick={toggleProfileDropdown} // Toggle the dropdown on click
              >
                👤
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                  <Link href="/admin/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
