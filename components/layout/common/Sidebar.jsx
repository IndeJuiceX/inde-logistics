'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ vendor, vendorId }) {
  const pathname = usePathname(); // Get the current path

  // Function to check if the link is active
  const isActive = (item) => {
    if (item.match) {
      return item.match(pathname);
    } else {
      return pathname === item.href;
    }
  };

  // Function to check if any of the submenu items are active
  const isSubMenuActive = (subMenu) => {
    return subMenu.some((item) => isActive(item));
  };

  // Menu Data
  const menuData = [
    {
      label: "Products",
      href: `/vendor/${vendorId}/products`,
      subMenu: [
        {
          label: "Add New Product",
          href: `/vendor/${vendorId}/products/upload`,
        },
        {
          label: "View Product",
          href: `/vendor/${vendorId}/products/view`,
        },
        {
          label: "Edit Product",
          href: `/vendor/${vendorId}/products/edit`, // Default link
          match: (path) => {
            const editProductPattern = new RegExp(`^/vendor/${vendorId}/product/[\\w-]+/edit$`);
            return editProductPattern.test(path);
          },
        },
      ],
    },
    {
      label: "Orders",
      href: `/vendor/${vendorId}/orders`,
    },
    {
      label: "Stock Shipments",
      href: `/vendor/${vendorId}/stock-shipments`,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-20">
      <div className="p-2 border-b-2 border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {vendor?.company_name || "Vendor"}
        </h2>
      </div>
      <ul className="space-y-4 mt-4">
        {menuData.map((menuItem) => {
          const hasSubMenu = menuItem.subMenu && menuItem.subMenu.length > 0;
          const menuItemActive = isActive(menuItem);
          const subMenuActive = hasSubMenu && isSubMenuActive(menuItem.subMenu);
          const isOpen = menuItemActive || subMenuActive;

          return (
            <li key={menuItem.label}>
              {hasSubMenu ? (
                <>
                  {/* Parent Menu Item with Submenu */}
                  <Link
                    href={menuItem.href}
                    className={`flex justify-between items-center py-2 px-4 rounded-lg transition ${
                      menuItemActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-blue-500 hover:text-white"
                    }`}
                  >
                    <span>{menuItem.label}</span>
                    <span
                      className={`transform transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"
                        }`}>
                      &gt;
                    </span>
                  </Link>
                  {/* Submenu */}
                  {isOpen && (
                    <ul className="ml-4 space-y-2 mt-2">
                      {menuItem.subMenu.map((subItem) => (
                        <li key={subItem.label}>
                          <Link
                            href={subItem.href}
                            className={`block py-2 px-4 rounded-lg transition ${
                              isActive(subItem)
                                ? "bg-blue-500 text-white"
                                : "text-gray-700 hover:bg-blue-500 hover:text-white"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // Menu Item without Submenu
                <Link
                  href={menuItem.href}
                  className={`block py-2 px-4 rounded-lg transition ${
                    menuItemActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {menuItem.label}
                </Link>
              )}
              <hr className="border-t border-gray-200" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}