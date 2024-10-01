'use client';

import Link from 'next/link';

export default function VendorMenu({ vendorId, vendorName }) {
    return (
        <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-3 rounded-t-lg shadow-md">
            {/* Left Side - Menu Links */}
            <div className="flex space-x-6">
                <Link href={`/admin/vendors/${vendorId}/products`} className="text-white hover:text-blue-400">
                    Products
                </Link>
                <Link href={`/admin/vendors/${vendorId}/orders`} className="text-white hover:text-blue-400">
                    Orders
                </Link>
                <Link href={`/admin/vendors/${vendorId}/shipments`} className="text-white hover:text-blue-400">
                    Stock Shipments
                </Link>
                <Link href={`/admin/vendors/${vendorId}/users`} className="text-white hover:text-blue-400">
                    Users
                </Link>
            </div>
            {/* Right Side - Vendor Name */}
            <div>
                <span className="text-white font-semibold">{vendorName}</span>
            </div>
        </div>
    );
}