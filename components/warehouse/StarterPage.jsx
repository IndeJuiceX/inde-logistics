'use client';
import Link from "next/link";
import { FaBoxOpen, FaTruck, FaWarehouse, FaSignOutAlt, FaDolly, FaBox, FaBoxes } from "react-icons/fa";
import { doLogOut } from '@/app/actions';

export default function StarterPage() {

    const handleLogout = async (e) => {
        e.preventDefault();
        await doLogOut();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-500">INDELOGISTICS</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <MenuCard href="/warehouse/all/stocks" icon={<FaBoxOpen />} title="Stock" />
                <MenuCard href="/warehouse/all/shipments" icon={<FaTruck />} title="Shipments" />
                <MenuCard href="/warehouse/all/unshelved" icon={<FaWarehouse />} title="Unshelved" />
                <MenuCard href="/warehouse/picking" icon={<FaBoxes />} title="Picking" />
                <MenuCard href="/warehouse/packing" icon={<FaBox />} title="Packing" />
                <MenuCard href="/logout" icon={<FaSignOutAlt />} title="Logout" onClick={(e) => handleLogout(e)} />
            </div>
        </div>
    );
}

function MenuCard({ href, icon, title, onClick }) {
    return (
        <Link href={href} className="group" onClick={onClick}>
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-gray-200 border border-gray-200 shadow-sm">
                <div className="text-4xl mb-4 text-blue-600 group-hover:text-blue-700">{icon}</div>
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
        </Link>
    );
}