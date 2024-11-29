'use client';

import { useState } from 'react';
import styles from '@/styles/warehouse/packing/OrderDispatch.module.scss';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';

export default function PickedAndLabeled() {
    const [isOpenConfirmation, setIsOpenConfirmation] = useState(false);
    const { handleCompleteOrder } = usePackingAppContext();


    const handleOpenConfirmation = () => {
        setIsOpenConfirmation(true);
    }
    return (
        <>
            <div className={styles.complete} onClick={handleOpenConfirmation}>
                {/* eslint-disable-next-line */}
                <img
                    src="https://dev.indejuice.com/img/wh/label_added.png"
                    alt="Letter"
                />
                <span>PACKED & LABELLED</span>
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
                <p className="text-white text-xl font-semibold mb-4">Place Parcel In Queue</p>

                {/* Buttons */}
                <div className="flex flex-col items-center gap-4">
                    <button className="px-6 py-3 bg-white text-teal-500 font-semibold rounded-full shadow-md hover:bg-gray-200" onClick={() => handleCompleteOrder(false)}>
                        COMPLETE
                    </button>
                    <button className="px-6 py-3 text-white border border-white rounded-full hover:bg-teal-600" onClick={() => handleCompleteOrder(true)}>
                        COMPLETE & LOGOUT
                    </button>
                </div>
            </PickingAppModal>
        </>
    )
}