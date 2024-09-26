import { auth } from "@/auth"; // Directly using auth() from NextAuth
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "@/components/layout/Dropdown"; // Client-side profile and sign-out button

export default async function AdminLayout({ children }) {
  // Get session using `auth()`
  const session = await auth();

  // If no session or the user is not an admin, redirect to the login page
  if (!session || session.user.role !== "admin") {
    redirect("/login"); // Redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white fixed top-0 bottom-0 left-0 z-10">
        <div className="py-6 px-4 bg-gray-900">
          <h2 className="text-2xl font-bold text-center">Admin</h2>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/vendors"
                className="block px-4 py-2 rounded text-white hover:bg-gray-700"
              >
                Vendors
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block px-4 py-2 rounded text-white hover:bg-gray-700"
              >
                System Users
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow p-4 fixed top-0 left-64 right-0 z-10">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          {/* Client-side profile dropdown for sign-out */}
          <ProfileDropdown />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-6 bg-gray-100 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
