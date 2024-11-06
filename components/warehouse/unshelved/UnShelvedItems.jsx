'use client'
import ShipmentHeader from "@/components/warehouse/ShipmentHeader";
import Modal from "@/components/warehouse/modal/Modal";
import UnShelvedItemModal from "@/components/warehouse/unshelved/UnShelvedItemModal";
import { useEffect, useState } from "react";
import ActionButtons from "@/components/warehouse/unshelved/ActionButtons";




export default function UnShelvedItems({ vendor, shipmentDetails, error = null }) {
    const [unshelvedItems, setUnshelvedItems] = useState(shipmentDetails.items ?? []);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // console.log('shipmentDetails 22', shipmentDetails);
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

    useEffect(() => {
        if (error !== null) {
            console.log('error', error);
            alert(error);
        }
    }, [error]);

    const handleShowItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    }

    return (
        <>
            <ShipmentHeader vendor={vendor} shipmentDetails={shipmentDetails} url={'unshelved'} />
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
                                    <td className="p-4 text-center text-base text-gray-700">{item.name}
                                    </td>
                                    {attributeKeys.length > 0 && attributeKeys.map((attribute, index) => (
                                        <td className="p-4 text-center text-base text-gray-700" key={index}>{item.attributes[attribute]}</td>
                                    ))}
                                    <td className="p-4 text-center text-base text-gray-700">
                                        <div className="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black h-10 w-24">
                                            <div className="flex items-center justify-center w-1/2 h-full text-lg" >
                                                {item?.warehouse && item.warehouse?.aisle ? item.warehouse.aisle : ''}
                                            </div>
                                            <div className="flex items-center justify-center w-1/2 h-full bg-white text-gray-800 text-lg" >
                                                {item?.warehouse && item.warehouse?.aisle_number ? item.warehouse.aisle_number : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-base text-gray-700">
                                        <div className="flex items-center bg-gray-800 text-white font-semibold rounded-md overflow-hidden border-4 border-black h-10 w-24">
                                            <div className="flex items-center justify-center w-1/2 h-full text-lg" >
                                                {item?.warehouse && item.warehouse?.shelf ? item.warehouse.shelf : ''}
                                            </div>
                                            <div className="flex items-center justify-center w-1/2 h-full bg-white text-gray-800 text-lg" >
                                                {item?.warehouse && item.warehouse?.shelf_number ? item.warehouse.shelf_number : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-base text-gray-700">x{item.received ? item.received : '-'}</td>
                                    <td className="p-4 text-center">
                                        <ActionButtons item={item} />

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {/* <ItemModal itemData={selectedItem} openModal={openModal} setIsModalOpen={setIsModalOpen} items={shipmentDetails.items}  /> */}
                <UnShelvedItemModal itemData={selectedItem} setIsModalOpen={setIsModalOpen} items={unshelvedItems} setUnshelvedItems={setUnshelvedItems} />
            </Modal >
        </>
    )
}