'use client';
import { useEffect } from 'react';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { getStationId, setStationId } from '@/services/utils/warehouse/packingStation';

export default function CheckSetStationId() {
    const {  isSetStationId, setIsSetStationId } = usePackingAppContext();
    useEffect(() => {
        const checkSetStationId = getStationId();
        if (checkSetStationId === null) {
            setIsSetStationId(false);
        }
        if (checkSetStationId) {
            setIsSetStationId(true);
        }

    }, [setIsSetStationId]);

    const handleSetStationId = (stationId) => {
        const response = setStationId(stationId);
        setIsSetStationId(true);
    }


    return (
        <>
            {!isSetStationId &&
                <div className="flex h-screen items-center justify-center bg-gray-100">
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
                                Select Station
                            </h2>
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
                                    onClick={() => handleSetStationId('1')}
                                >
                                    Station 1
                                </button>
                                <button
                                    className="px-6 py-3 text-lg font-semibold text-white bg-green-500 rounded-md shadow hover:bg-green-600 focus:ring-4 focus:ring-green-300"
                                    onClick={() => handleSetStationId('2')}
                                >
                                    Station 2
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}