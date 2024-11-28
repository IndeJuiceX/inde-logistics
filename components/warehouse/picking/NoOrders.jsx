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
        // console.log('checkingNewOrders');
        // app/api/v1/admin/order-shipments/get-next-unpicked/route.js
        // const response = await fetch('/api/v1/admin/order-shipments/get-next-unpicked');
        // const data = await response.json();
        // console.log('data', data);
        const data = await getNextUnPickedOrderShipment();


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
        <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} statusClass={status} >
         
            <div>
                <h1>{statusHeading}</h1>
                {isNewOrder && <Link className={styles.viewOrderLink} href = {'/warehouse/picking'}>View Order</Link>}
                <button onClick={handleSignOut}>Sign Out</button>

            </div>
        </ PickingAppModal>
    )
}