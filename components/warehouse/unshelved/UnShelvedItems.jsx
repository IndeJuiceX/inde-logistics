'use client'
import ShipmentHeader from "@/components/warehouse/ShipmentHeader";
import Modal from "@/components/warehouse/modal/Modal";
import UnShelvedItemModal from "@/components/warehouse/unshelved/UnShelvedItemModal";
import { useEffect, useState } from "react";




export default function UnShelvedItems({ vendor, shipmentDetails }) {
    const [unshelvedItems, setUnshelvedItems] = useState(shipmentDetails.items ?? []);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // console.log('shipmentDetails', unshelvedItems);
    // console.log('vendor', vendor);
    const attributeKeys = [];
    if (unshelvedItems && unshelvedItems.length > 0) {
        unshelvedItems.forEach(item => {
            const keys = Object.keys(item.attributes || {});
            keys.forEach(key => {
                if (!attributeKeys.includes(key)) {
                    attributeKeys.push(key);
                }
            });
        });
    }
    // console.log('attributeKeys', unshelvedItems);
    // useEffect(() => {
    //     const getUnshelvedItems = async () => {
    //         try {
    //             const response = await fetch(`/api/v1/admin/stock-shipments/get-unshelved-items?vendor_id=${vendor.vendor_id}&stock_shipment_id=${shipmentDetails.shipment_id}`);
    //             const data = await response.json();
    //             console.log('response data', data);
    //         } catch (error) {
    //             console.error('Unhandled error:', error);
    //         }
    //     }
    //     if (shipmentDetails && vendor) {
    //         console.log('shipmentDetails', shipmentDetails);
    //         console.log('vendor', vendor);
    //         getUnshelvedItems();
    //     }
    // }, [shipmentDetails, vendor]);

    const handleShowItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    }

    return (
        <>
            <ShipmentHeader vendor={vendor} shipmentDetails={unshelvedItems} />
            <div className="overflow-x-auto">

                <div className="mb-4">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left text-base font-semibold text-gray-700">IMAGE</th>
                                <th className="p-4 text-left text-base font-semibold text-gray-700">PRODUCT</th>
                                {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                    <th className="p-4 text-center text-base font-semibold text-gray-700" key={index}>{attribute.toUpperCase()}</th>
                                ))}
                                <th className="p-4 text-center text-base font-semibold text-gray-700">AISLE</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">SHELF</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700">QUANTITY</th>
                                <th className="p-4 text-center text-base font-semibold text-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {unshelvedItems && unshelvedItems.length > 0 && unshelvedItems.map((item, index) => (
                                <tr className="hover:bg-gray-50 cursor-pointer border-b border-gray-200" key={index} onClick={() => handleShowItem(item)}>
                                    <td className="py-4 px-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-12" />
                                    </td>
                                    <td className="p-4 flex items-center space-x-2 text-gray-700 text-base">{item.name}
                                    </td>
                                    {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                        <td className="p-4 text-center text-base text-gray-700" key={index}>{item.attributes[attribute]}</td>
                                    ))}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {/* <ItemModal itemData={selectedItem} openModal={openModal} setIsModalOpen={setIsModalOpen} items={shipmentDetails.items}  /> */}
                <UnShelvedItemModal itemData={selectedItem}  setIsModalOpen={setIsModalOpen} items={unshelvedItems} />
            </Modal >
        </>
    )
}