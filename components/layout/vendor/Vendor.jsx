import { auth } from "@/auth"; // Import auth directly from NextAuth
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/layout/Dropdown"; // Abstracted client-side profile and sign-out component

export default async function VendorLayout({ children }) {
  // Get session using `auth()`
  const session = await auth();

  // If no session or the user is not a vendor, redirect to the login page
  if (!session || session.user.role !== "vendor") {
    redirect("/login"); // Redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg h-screen">
        <div className="p-6 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{session?.user?.vendor_name || "Vendor"}</h2>
        </div>
        <ul className="space-y-4 mt-4">
          <li>
            <Link href="/vendor/products" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Products
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link href="/vendor/orders" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Orders
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link href="/vendor/shipments" className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition">
              Stock Shipments
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 relative">
        {/* Profile Button (ProfileDropdown component) */}
        <div className="absolute top-4 right-4">
          <ProfileDropdown /> {/* Reusable client-side profile dropdown */}
        </div>

        {/* Page-specific Content */}
        {children}
      </div>
    </div>
  );
}
