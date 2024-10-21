import ProfileDropdown from "@/components/layout/Dropdown";


export default function Header({ vendorName }) {
    return (
      <div className="fixed top-0 right-0 left-64 bg-white shadow p-4 z-10 flex justify-between">
        <h1 className="text-xl font-semibold">{vendorName} Dashboard</h1>
        <ProfileDropdown /> {/* Dynamically loaded ProfileDropdown */}
      </div>
    );
  }
  