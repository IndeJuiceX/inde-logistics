'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VendorMenu({ vendorId }) {
  const pathname = usePathname();
  const [vendorName, setVendorName] = useState('Vendor');

  const menuItems = [
    { name: 'Products', href: `/admin/vendors/${vendorId}/products` },
    { name: 'Orders', href: `/admin/vendors/${vendorId}/orders` },
    { name: 'Stock Shipments', href: `/admin/vendors/${vendorId}/shipments` },
    { name: 'Users', href: `/admin/vendors/${vendorId}/users` },
  ];

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



  return (
    <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-3 rounded-t-lg shadow-md">
      <div className="flex space-x-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
                }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      <div>
        <span className="text-white font-semibold">{vendorName}</span>
      </div>
    </div>
  );
}