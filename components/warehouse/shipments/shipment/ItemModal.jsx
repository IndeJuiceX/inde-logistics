'use client';

import { useState } from 'react';
import DialPad from '@/components/warehouse/shipments/shipment/DialPad';



export default function ItemModal({ setIsModalOpen, item = null }) {
    const [activeClick, setActiveClick] = useState(false);
    console.log('item', item);

    const handleActiveClick = () => {
        // I want to toggle the activeClick state here
        setActiveClick(!activeClick);
    }

    return (
        // <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <>
            <div className="mt-4 flex flex-col h-full">
                <h2 className="text-center text-lg font-semibold text-black mb-2">{item?.name}</h2>
                <p className="text-center text-sm text-gray-500 mb-4">{item && Object.values(item.attributes)
                    .filter(value => !Array.isArray(value))
                    .join(' • ')
                }</p>

                <div className="space-y-2 flex-grow">
                    <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeClick ? 'border-green-500' : ''}`} onClick={handleActiveClick}>
                        <span className="text-red-500">Sent:</span>
                        <span className="font-semibold text-black">{item?.quantity}</span>
                    </div>
                    <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeClick ? 'border-green-500' : ''}`} onClick={handleActiveClick}>
                        <span className="text-black">Received:</span>
                        <span className="font-semibold text-black">5</span>
                    </div>
                    <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeClick ? 'border-green-500' : ''}`} onClick={handleActiveClick}>
                        <span className="text-black">Faulty:</span>
                        <span className="font-semibold text-black">1</span>
                    </div>
                    <div className={`flex items-center justify-between p-2 bg-white border border-4 rounded-md ${activeClick ? 'border-green-500' : ''}`} onClick={handleActiveClick} >
                        <span className="text-blue-500">Accepted:</span>
                        <span className="font-semibold text-black">4</span>
                    </div>
                </div>
                {!activeClick && (
                    <>
                        <div className="flex justify-center mt-4">
                            <img src="https://cdn.indejuice.com/images/ZAE_small.jpg" alt="Product Image" className="w-[18rem] h-auto " />
                        </div>

                        <div className="flex justify-center mt-2">
                            <div className="bg-black text-white text-sm font-mono px-3 py-1 rounded-md">5056168817092</div>
                        </div>

                        <div className="flex justify-between mt-6 mb-6">
                            <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled="">Previous</button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsModalOpen(false)}>Close</button>
                            <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled="">Next</button>
                        </div>
                    </>
                )}
                {activeClick && (
                    <DialPad />
                )}
            </div>





        </>
    )
}