'use client'

import { useState } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';

export default function ReGenerateLabel({ isOpen, setIsOpen }) {
    // const [isOpenModal, setIsOpenModal] = useState(true);
    const [status, setStatus] = useState('noOrder');
    const [statusHeading, setStatusHeading] = useState('Label Already Printed. Do you want to re-generate?');

    return (
        <PickingAppModal isOpen={isOpen} onClose={() => setIsOpen(false)}  >
            <div className="flex flex-col items-center space-y-4">
                <h1 className="text-black text-lg">{statusHeading}</h1>

                <button className="bg-white border border-gray-800 text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" >
                    Yes, Reprint
                </button>
                <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={() => setIsOpen(false)}>
                    No, Cancel
                </button>
            </div>
        </ PickingAppModal>
    )
}