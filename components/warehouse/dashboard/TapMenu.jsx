'use client'

import Link from "next/link"
import { usePathname, useParams } from "next/navigation";


export default function TapMenu() {
    const { vendor_id } = useParams();
    const pathname = usePathname();
    const activePage = pathname.split("/").pop();

    return (
        <div className="flex items-center space-x-4 mb-6">
            <Link href={`/warehouse/${vendor_id}/stocks`} className={`px-6 py-2 rounded-md ${activePage === 'stocks' ? 'bg-gray-700' : 'bg-gray-800'}`}>STOCK</Link>

            <Link href={`/warehouse/${vendor_id}/shipments`} className={`px-6 py-2 rounded-md ${activePage === 'shipments' ? 'bg-gray-700' : 'bg-gray-800'
                }`}>SHIPMENTS</Link>

            <Link href={`/warehouse/${vendor_id}/unshelved`} className={`px-6 py-2 rounded-md ${activePage === 'unshelved' ? 'bg-gray-700' : 'bg-gray-800'
                }`}>UNSHELVED</Link>

            <span className="flex-grow"></span>
            <button className="bg-green-500 w-3 h-3 rounded-full mr-2"></button>
            <span className="font-semibold">LOGOUT</span>
        </div>
    )
}