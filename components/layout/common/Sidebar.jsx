"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CubeIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  TruckIcon,
  DocumentPlusIcon,
  ArrowUpOnSquareIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ vendor, vendorId }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const renderMenuItems = (items, level = 0) => {
    return items.map((menuItem) => {
      const hasSubMenu = menuItem.subMenu && menuItem.subMenu.length > 0;
      const menuItemActive = isActive(menuItem);
      const subMenuActive = hasSubMenu && isSubMenuActive(menuItem.subMenu);
      const isOpen = menuItemActive || subMenuActive;

      // Dynamic padding based on nesting level
      const paddingLeft = 16 + level * 16;

      // Determine styles based on level (parent or child)
      const baseClasses =
        "flex items-center justify-between py-2 px-4 transition-colors duration-200";
      let menuItemClasses = "";
      let textStyle = "";
      let iconColor = "text-gray-500";

      if (level === 0) {
        // Parent items
        menuItemClasses = `${baseClasses} ${menuItemActive
          ? "bg-blue-600 text-white"
          : subMenuActive
            ? "bg-gray-100 text-gray-800"
            : "text-gray-800 hover:bg-gray-100"
          }`;
        textStyle = "font-medium";
      } else {
        // Child items
        menuItemClasses = `${baseClasses} ${menuItemActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
          }`;
        textStyle = "font-normal";
        iconColor = "text-gray-400";
      }

      return (
        <li key={menuItem.label}>
          <Link
            href={menuItem.href}
            className={menuItemClasses}
            style={{ paddingLeft: `${paddingLeft}px` }}
            aria-expanded={hasSubMenu ? isOpen : undefined}
          >
            <div className="flex items-center">
              {menuItem.icon && (
                <span className={`mr-3 ${iconColor}`}>{menuItem.icon}</span>
              )}
              <span className={textStyle}>{menuItem.label}</span>
            </div>
            {hasSubMenu && (
              <ChevronRightIcon
                className={`w-5 h-5 ${iconColor} transform transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                  }`}
              />
            )}
          </Link>
          {/* Submenu */}
          {hasSubMenu && (
            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-screen" : "max-h-0"
                }`}
            >
              <ul>{renderMenuItems(menuItem.subMenu, level + 1)}</ul>
            </div>
          )}
        </li>
      );
    });
  };

  // Menu Data with icons
  const menuData = [
    {
      label: "Products",
      href: `/vendor/${vendorId}/products`,
      icon: <CubeIcon className="w-5 h-5" />,
      subMenu: [
        {
          label: "Add New Product",
          href: `/vendor/${vendorId}/products/upload`,
          icon: <PlusCircleIcon className="w-5 h-5" />,
        },
        {
          label: "View Products",
          href: `/vendor/${vendorId}/products/all`,
          icon: <Squares2X2Icon className="w-5 h-5" />,
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
      icon: <ShoppingCartIcon className="w-5 h-5" />,
    },
    {
      label: "Stock Shipments",
      href: `/vendor/${vendorId}/stock-shipments`,
      icon: <TruckIcon className="w-5 h-5" />,
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
          icon: <DocumentPlusIcon className="w-5 h-5" />,
          subMenu: [
            {
              label: "Create Manually",
              href: `/vendor/${vendorId}/stock-shipments/create/manual`,
              icon: <PlusCircleIcon className="w-5 h-5" />,
            },
            {
              label: "Upload File",
              href: `/vendor/${vendorId}/stock-shipments/create/upload`,
              icon: <ArrowUpOnSquareIcon className="w-5 h-5" />,
            },
          ],
        },
      ],
    },
    {
      label: "Activity Logs",
      href: `/vendor/${vendorId}/api-logs`,
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      // You can add subMenu or match properties if needed
    },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className="p-2 text-gray-500 bg-white rounded-md md:hidden fixed top-4 left-4 z-30"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-20 overflow-y-auto transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          {/* Vendor Logo and Name */}
          <div className="flex items-center">
            {/* {vendor?.logoUrl && (
              <img
                src={vendor.logoUrl}
                alt="Vendor Logo"
                className="w-10 h-10 rounded-full mr-3"
              />
            )} */}
            <h2 className="text-xl font-semibold text-gray-800">
              {vendor?.company_name || "Vendor"}
            </h2>
          </div>
        </div>
        <ul>{renderMenuItems(menuData)}</ul>
      </div>
    </>
  );
}