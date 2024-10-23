"use client";

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

  // Function to check if any of the submenu items are active (recursive)
  const isSubMenuActive = (subMenu) => {
    return subMenu.some((item) => {
      return (
        isActive(item) || (item.subMenu && isSubMenuActive(item.subMenu))
      );
    });
  };

  // Recursive function to render menu items
  const renderMenuItems = (items, level = 0) => {
    return items.map((menuItem) => {
      const hasSubMenu = menuItem.subMenu && menuItem.subMenu.length > 0;
      const menuItemActive = isActive(menuItem);
      const subMenuActive =
        hasSubMenu && isSubMenuActive(menuItem.subMenu);
      const isOpen = menuItemActive || subMenuActive;

      // Dynamic padding based on nesting level
      const paddingLeft = 16 + level * 16; // Base padding + indentation per level

      return (
        <li key={menuItem.label} className="border-b border-gray-200">
          <Link
            href={menuItem.href}
            className={`block py-2 transition-all duration-200 ${
              menuItemActive
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-blue-500 hover:text-white"
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex justify-between items-center">
              <span>{menuItem.label}</span>
              {hasSubMenu && (
                <span className="transform transition-transform duration-200">
                  {isOpen ? "▼" : "▶"}
                </span>
              )}
            </div>
          </Link>
          {/* Submenu */}
          {hasSubMenu && isOpen && (
            <ul>{renderMenuItems(menuItem.subMenu, level + 1)}</ul>
          )}
        </li>
      );
    });
  };

  // Menu Data with potential nested submenus
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
          label: "View Products",
          href: `/vendor/${vendorId}/products/all`,
          match: (path) => {
            const viewProductsPath = `/vendor/${vendorId}/products/all`;
            const editProductPattern = new RegExp(
              `^/vendor/${vendorId}/product/[\\w-]+/edit$`
            );
            const viewProductPattern = new RegExp(
              `^/vendor/${vendorId}/product/[\\w-]+$`
            );

            return (
              path === viewProductsPath ||
              editProductPattern.test(path) ||
              viewProductPattern.test(path)
            );
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
      match: (path) => {
        const viewProductsPath = `/vendor/${vendorId}/stock-shipments`;
        const editProductPattern = new RegExp(
          `^/vendor/${vendorId}/stock-shipments/[\\w-]+/edit$`
        );
        const viewProductPattern = new RegExp(
          `^/vendor/${vendorId}/stock-shipments/[\\w-]+$`
        );

        return (
          path === viewProductsPath ||
          editProductPattern.test(path) ||
          viewProductPattern.test(path)
        );
      },
      subMenu: [
        {
          label: "Create",
          href: `/vendor/${vendorId}/stock-shipments/create`,
          subMenu: [
            {
              label: "Create Manually",
              href: `/vendor/${vendorId}/stock-shipments/create/manual`,
            },
            {
              label: "Upload File",
              href: `/vendor/${vendorId}/stock-shipments/create/upload`,
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-20 overflow-y-auto">
      <div className="p-4 border-b-2 border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800">
          {vendor?.company_name || "Vendor"}
        </h2>
      </div>
      <ul>{renderMenuItems(menuData)}</ul>
    </div>
  );
}