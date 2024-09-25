'use client'

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';  // You can replace this with an emoji if you want

export default function VendorDashboard() {

  return (
    <div className="text-center">
      {/* Welcome Message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard</h1>
      <p className="text-lg text-gray-600">Manage your profile, products, orders, and stock shipments.</p>

      {/* Example Content: Recent Orders */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <p className="text-gray-700">You currently have no recent orders.</p>
      </div>
    </div>
  );
}

