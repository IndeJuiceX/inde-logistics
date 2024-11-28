'use client';
import { useEffect } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { getStationId, setStationId } from '@/services/utils/warehouse/packingStation';

export default function CheckSetStationId() {
    const { isOpenModal, setIsOpenModal, isSetStationId, setIsSetStationId } = usePackingAppContext();
    useEffect(() => {
        const checkSetStationId = getStationId();
        if (checkSetStationId === null) {
            setIsOpenModal(true);
            setIsSetStationId(false);
        }
        if (checkSetStationId) {
            setIsOpenModal(false);
            setIsSetStationId(true);
        }

    }, [setIsOpenModal, setIsSetStationId]);

    const handleSetStationId = (stationId) => {
        const response = setStationId(stationId);
        setIsOpenModal(false);
        setIsSetStationId(true);
    }


    return (
        <>
            {!isSetStationId &&
                <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(true)} statusClass='newOrder'  >
                    <div className="flex h-screen items-center justify-center bg-gray-100">
                        <div className="space-x-4">
                            <button className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:ring-4 focus:ring-blue-300" onClick={() => handleSetStationId('1')}>
                                Station 1
                            </button>
                            <button className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:ring-4 focus:ring-green-300" onClick={() => handleSetStationId('2')}>
                                Station 2
                            </button>
                        </div>
                    </div>
                </PickingAppModal>}
        </>
    );
}