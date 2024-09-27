import { getLoggedInUser } from "@/app/actions"; 
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/layout/Dropdown"; 
import { getVendorById } from "@/services/data/vendor";

export default async function VendorLayout({ children }) {
  // Get session using `auth()`
  const user = await getLoggedInUser();

  // If no session or the user is not a vendor, redirect to the login page
  if (!user || user.role !== "vendor") {
    redirect("/login"); 
  }
  
  const { data } = await getVendorById(user.vendor);
  const vendorDetails = data;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-20">
        <div className="p-6 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {vendorDetails?.company_name || "Vendor"}
          </h2>
        </div>
        <ul className="space-y-4 mt-4">
          <li>
            <Link
              href={`/vendor/${user?.vendor}/products`}
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Products
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link
              href={`/vendor/${user?.vendor}/orders`}
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Orders
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
          <li>
            <Link
              href={`/vendor/${user?.vendor}/stock-shipments`}
              className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition"
            >
              Stock Shipments
            </Link>
            <hr className="border-t border-gray-200" />
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 relative overflow-auto">
        {/* Header - Profile Button */}
        <div className="fixed top-0 right-0 left-64 bg-white shadow p-4 z-10 flex justify-between">
          <h1 className="text-xl font-semibold"> {vendorDetails.company_name}  Dashboard</h1>
          <ProfileDropdown /> {/* Profile dropdown component */}
        </div>

        {/* Page-specific Content */}
        <div className="mt-20 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
