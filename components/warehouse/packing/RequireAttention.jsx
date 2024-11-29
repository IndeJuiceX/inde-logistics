'use client';
import { useState } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
export default function RequireAttention({ styles }) {
    const [isOpenRequireAttention, setIsOpenRequireAttention] = useState(false);
    const { addToRequireAttentionQueue } = usePackingAppContext();
    const handleRequireAttention = () => {
        setIsOpenRequireAttention(true);
    }
    return (
        <>
            <div className={`${styles.action} ${styles.customSize} `} onClick={handleRequireAttention}>

                {/* eslint-disable-next-line */}
                <img
                    src="https://dev.indejuice.com/img/wh/warning.png"
                    alt="Extra Large Parcel"
                />
                REQUIRES ATTENTION
            </div>
            <PickingAppModal isOpen={isOpenRequireAttention} onClose={() => setIsOpenRequireAttention(false)} statusClass={'error'}>
                <div className="flex items-center justify-center min-h-screen bg-red-400">
                    <div className="text-center">
                        <h1 className="text-sm uppercase text-gray-100 font-bold mb-6">Select Problem</h1>
                        <div className="space-y-4">
                            <button className="w-full px-6 py-3 bg-white text-red-400 font-bold rounded-full shadow-md hover:bg-gray-100" onClick={() => addToRequireAttentionQueue('Missing Item')}>
                                Missing Item
                            </button>
                            <button className="w-full px-6 py-3 bg-white text-red-400 font-bold rounded-full shadow-md hover:bg-gray-100" onClick={() => addToRequireAttentionQueue('Bottle Leaking')}>
                                Bottle Leaking
                            </button>
                            <button className="w-full px-6 py-3 bg-white text-red-400 font-bold rounded-full shadow-md hover:bg-gray-100" onClick={() => addToRequireAttentionQueue('Requires Larger Parcel')}>
                                Requires Larger Parcel
                            </button>
                            <button className="w-full px-6 py-3 bg-white text-red-400 font-bold rounded-full shadow-md hover:bg-gray-100" onClick={() => addToRequireAttentionQueue('Label Error')}>
                                Label Error
                            </button>
                            <button className="w-full px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full shadow-md hover:bg-red-500" onClick={() => addToRequireAttentionQueue('Other')}>
                                Other
                            </button>
                        </div>
                    </div>
                </div>
            </PickingAppModal>
        </>
    )
}