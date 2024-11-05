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


    const handleShowItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    }

    useEffect(() => {
        console.log('shipmentDetails', unshelvedItems);
    }, [unshelvedItems]);


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
                                        {/* this butts are need for the actions */}
                                        {/* <div className="flex items-center justify-center w-20 h-10 border-4 border-green-500 rounded">
                                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke="currentColor" stroke-width="1.5" fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"></path>
                                            </svg>
                                        </div> */}

                                        <div className="flex items-center justify-center w-20 h-10 bg-gray-200 rounded">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke="currentColor" strokeWidth="1.5" fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
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