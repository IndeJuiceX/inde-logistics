'use client';

import { useState } from 'react';
import Link from 'next/link';
import { doLogOut } from '@/app/actions'; // Client-side sign-out

const ProfileDropdown = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleSignOut = async () => {
    await doLogOut(); // Redirect to login after sign-out
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <div
          className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center cursor-pointer"
          onClick={toggleProfileDropdown}
        >
          👤
        </div>

        {profileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
            <Link href="/admin/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDropdown;