import { getLoggedInUser } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/layout/Dropdown";
import { getVendorById } from "@/services/data/vendor";
import Sidebar from "@/components/layout/common/Sidebar";
import Header from "@/components/layout/common/Header";


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
      {/* Sidebar Component */}
      <Sidebar vendor={vendorDetails} vendorId={user?.vendor} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 relative overflow-auto">
        {/* Header Component */}
        <Header vendorName={vendorDetails?.company_name} />

        {/* Page-specific Content */}
        <div className="mt-20 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
