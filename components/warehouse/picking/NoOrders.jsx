'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePickingAppContext } from '@/contexts/PickingAppContext';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { getNextUnPickedOrderShipment } from '@/services/data/order-shipment';
export default function NoOrders() {
    const { handleSignOut } = usePickingAppContext();
    const [isOpenModal, setIsOpenModal] = useState(true);
    const [isNewOrder, setIsNewOrder] = useState(false);
    const [status, setStatus] = useState('noOrder');
    const [statusHeading, setStatusHeading] = useState('No Orders Found');

    const checkingNewOrders = async () => {
        const data = await getNextUnPickedOrderShipment();

        if (data.success && data.data && !Array.isArray(data.data)) {
            setIsNewOrder(true);
            setStatus('newOrder');
            setStatusHeading('New Order Found');
        }

    };

    useEffect(() => {
        const intervalId = setInterval(checkingNewOrders, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);



    return (
        <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(true)} statusClass={status} >
            <div className="flex flex-col items-center space-y-4">
                <h1 className="text-black text-lg">{statusHeading}</h1>
                {isNewOrder && (
                    <button onClick={() => {
                        window.location.href = '/warehouse/picking';
                    }} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" >
                        View Order
                    </button>
                )}
                <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={() => {
                    window.location.href = '/warehouse';
                }}>
                    Menu
                </button>
                <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={handleSignOut}>
                    Logout
                </button>
            </div>
        </ PickingAppModal>
    )
}