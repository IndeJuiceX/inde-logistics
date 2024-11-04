'use client'
import ShipmentHeader from "@/components/warehouse/ShipmentHeader";
import { useEffect, useState } from "react";




export default function UnShelvedItems({ vendor, shipmentDetails }) {
    const [unshelvedItems, setUnshelvedItems] = useState([]);

    console.log('shipmentDetails', shipmentDetails);
    console.log('vendor', vendor);

    useEffect(() => {
        const getUnshelvedItems = async () => {
            try {
                const response = await fetch(`/api/v1/admin/stock-shipments/get-unshelved-items?vendor_id=${vendor.vendor_id}&stock_shipment_id=${shipmentDetails.shipment_id}`);
                const data = await response.json();
                console.log('response data', data);
            } catch (error) {
                console.error('Unhandled error:', error);
            }
        }
        if (shipmentDetails && vendor) {
            console.log('shipmentDetails', shipmentDetails);
            console.log('vendor', vendor);
            getUnshelvedItems();
        }


    }, [shipmentDetails, vendor]);

    return (
        <>
            <ShipmentHeader vendor={vendor} shipmentDetails={shipmentDetails} />
            <div className="overflow-x-auto">

                <div className="mb-4">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left text-base font-semibold text-gray-700">IMAGE</th>
                                <th className="p-4 text-left text-base font-semibold text-gray-700">PRODUCT</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">ML</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">MG</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">VG/PG</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">AISLE</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">SHELF</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">QUANTITY</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr className="hover:bg-gray-50 cursor-pointer border-b border-gray-200" >
                                <td className="p-4 flex items-center space-x-2 text-gray-700 text-base">Pineapple Lemon (Aroma King Gem 600)
                                </td>
                                <td className="p-4 text-center text-base text-gray-700">2</td>
                                <td className="p-4 text-center text-base text-gray-700">20</td>
                                <td className="p-4 text-center text-base text-gray-700">50</td>
                                <td className="p-4 text-center text-base text-gray-700">
                                    <div className="inline-flex items-center space-x-1">
                                        <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white text-sm font-bold">M</div>
                                        <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white text-sm font-bold">3</div>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-base text-gray-700">
                                    <div className="inline-flex items-center space-x-1">
                                        <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white text-sm font-bold">Y</div>
                                        <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-800 text-white text-sm font-bold">7</div>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-base text-gray-700">x30</td>
                                <td className="p-4 text-center">
                                    <button ng-if="isAllocated(item)" ng-click="shelfItem(item)" ng-disabled="item.shelved > 0" className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 disabled:bg-gray-200">
                                        ✔
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    )
}