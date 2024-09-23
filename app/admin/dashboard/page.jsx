'use client'

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Menu */}
   
      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {/* Profile avatar at the top-right corner */}

        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard</h1>
          <p className="text-lg text-gray-600">Manage vendors, system users, and settings.</p>

          {/* Example Content */}
          <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <p className="text-gray-700">Here, you can view and manage vendors and system users.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
