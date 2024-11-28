'use client';

import { useState, useEffect } from 'react';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import styles from '@/styles/warehouse/picking-app/Picking.module.scss';
import { getNextUnPackedOrder } from '@/services/data/order-shipment';

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

        const data = await getNextUnPackedOrder();


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
            {/* background-color: #00d084; */}
            <div>
                <h1>{statusHeading}</h1>
                {isNewOrder && <button className={styles.viewOrderLink} onClick={() => window.location.href = '/warehouse/packing'}>View Order</button>}
                <button onClick={handleSignOut}>Sign Out</button>

            </div>
        </ PickingAppModal>
    )
}