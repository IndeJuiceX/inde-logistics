'use client';

import { useState, useEffect } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { getNextUnPackedOrderShipment } from '@/services/data/order-shipment';

export default function PackingNoOrders() {
    // const { handleSignOut } = usePackingAppContext();
    const [isOpenModal, setIsOpenModal] = useState(true);
    const [isNewOrder, setIsNewOrder] = useState(false);
    const [status, setStatus] = useState('noOrder');
    const [statusHeading, setStatusHeading] = useState('No Orders Found');
    const handleSignOut = async () => {
        await doLogOut();
    }
    const checkingNewOrders = async () => {

        const data = await getNextUnPackedOrderShipment();


        if (data.success && data.data && !Array.isArray(data.data)) {
            setIsNewOrder(true);
            setStatus('newOrder');
            setStatusHeading('New Order Found');
        }

    };

    useEffect(() => {
        const intervalId = setInterval(checkingNewOrders, 2 * 60 * 1000); // 2 minutes in milliseconds
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);



    return (
        <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(true)} statusClass={status} >
            <div className="flex flex-col items-center space-y-4">
                <h1 className="text-black text-lg">{statusHeading}</h1>
                {isNewOrder && (
                    <button onClick={() => window.location.href = '/warehouse/packing'} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" >
                        View Order
                    </button>
                )}
                <button className="bg-red-600 border border-white text-white-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={() => window.location.href = '/warehouse/error'}>
                    Error Queue
                </button>
                <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={handleSignOut}>
                    Logout
                </button>
            </div>
        </ PickingAppModal>
    )
}