'use client';

import { useState } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { useErrorAppContext } from '@/contexts/ErrorAppContext';


export default function ErrorResolved() {
    const [isOpenConfirmation, setIsOpenConfirmation] = useState(false);
    const { handleCompleteOrder } = useErrorAppContext();
    const handleOpenConfirmation = () => {
        setIsOpenConfirmation(true);
    }
    return (
        <>
            <div className="flex items-center bg-white p-4 rounded shadow justify-center w-1/2" onClick={handleOpenConfirmation} >
                {/* eslint-disable-next-line */}
                <img src="https://dev.indejuice.com/img/wh/tick_green_large.png" alt="Tick Icon" className="ml-2 h-9" />
            </div>
            <PickingAppModal isOpen={isOpenConfirmation} onClose={() => setIsOpenConfirmation(false)} statusClass={'newOrder'}>

                {/* Image */}
                <div className="flex justify-center mb-6">
                    {/* eslint-disable-next-line */}
                    <img
                        src="https://dev.indejuice.com/img/wh/send_parcel_small.png"
                        alt="Send Parcel"
                        className="w-32 h-32"
                    />
                </div>

                {/* Title */}
                <p className="text-black text-xl font-semibold mb-4">Place Parcel In Queue</p>

                {/* Buttons */}
                <div className="flex flex-col items-center gap-4">
                    <button className="px-6 py-3 bg-green text-teal-500 font-semibold rounded-full shadow-md hover:bg-gray-200" onClick={() => handleCompleteOrder(false)}>
                        COMPLETE
                    </button>
                    <button className="px-6 py-3 text-green border border-white rounded-full hover:bg-teal-600" onClick={() => handleCompleteOrder(true)}>
                        COMPLETE & LOGOUT
                    </button>
                </div>
            </PickingAppModal>
        </>
    )
}