'use client'

import Link from "next/link"
import { usePathname } from "next/navigation";


export default function TapMenu() {
    const pathname = usePathname();
    const activePage = pathname.split("/").pop();
    
    return (
        <div className="flex items-center space-x-4 mb-6">
            <Link href="/warehouse/stock" className={`px-6 py-2 rounded-md ${activePage === 'stock' ? 'bg-gray-700' : 'bg-gray-800'}`}>STOCK</Link>

            <Link href="/warehouse/shipment" className={`px-6 py-2 rounded-md ${activePage === 'shipment' ? 'bg-gray-700' : 'bg-gray-800'
                }`}>SHIPMENTS</Link>

            <Link href="/warehouse/unshelve" className={`px-6 py-2 rounded-md ${activePage === 'unshelve' ? 'bg-gray-700' : 'bg-gray-800'
                }`}>UNSHELVED</Link>

            <span className="flex-grow"></span>
            <button className="bg-green-500 w-3 h-3 rounded-full mr-2"></button>
            <span className="font-semibold">LOGOUT</span>
        </div>
    )
}