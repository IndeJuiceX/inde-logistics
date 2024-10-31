import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VendorMenu({ vendorId, vendorName }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Products', href: `/admin/vendors/${vendorId}/products` },
    { name: 'Orders', href: `/admin/vendors/${vendorId}/orders` },
    { name: 'Stock Shipments', href: `/admin/vendors/${vendorId}/shipments` },
    { name: 'Users', href: `/admin/vendors/${vendorId}/users` },
  ];

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-3 rounded-t-lg shadow-md">
      <div className="flex space-x-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md ${
                isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
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