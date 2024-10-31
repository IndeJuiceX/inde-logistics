import Link from "next/link";

export default function StarterPage() {
    return (
        <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
                <h1 className="text-4xl font-semibold">Welcome to Warehouse</h1>
                <p className="mt-2 text-white">Please select a menu to start</p>
                <Link href="/warehouse/shipment" className={`px-6 py-2 rounded-md  bg-gray-800`}>SHIPMENTS</Link>
            </div>
            
            {/* <Link>Picking</Link>
            <Link>Packing</Link> */}
        </div >
    );
}