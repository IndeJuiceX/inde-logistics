import Link from "next/link";

export default function ShipmentHeader({ vendor, shipmentDetails }) {
    return (
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Link className="bg-gray-600 rounded-full p-2" href={`/warehouse/${vendor.vendor_id}/shipments`}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
                <div className="text-gray-400">
                    <span className="text-gray-100 font-medium">{vendor?.company_name}</span> {'>'} <span>Shipment #{shipmentDetails?.shipment_id}</span>
                </div>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md">
                CLEAR
            </button>
        </div>
    )
}