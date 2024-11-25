'use client';


import { usePackingAppContext } from '@/contexts/PackingAppContext';
import styles from '@/styles/warehouse/packing/PackingHeader.module.scss';

export default function PackingHeader() {
    const { order } = usePackingAppContext();
    const couriers = order?.shipment?.courier;
    const shipmentCode = couriers[0]?.shipping_code;
    const shippingCode = shipmentCode?.split('-')[1];
    

    // console.log('courier', shippingCode);

    return (
        <div className={styles.headerSection}>
            <div className={styles.orderCode}>X10</div>
            <div className={styles.infoSection}>
                <p className={styles.label}>Customer</p>
                <p className={styles.value}>{order?.buyer?.name || 'G M'}</p>
            </div>
            <div className={styles.infoSection}>
                <p className={styles.label}>Delivery</p>
                <p className={styles.value}>{shippingCode || '-'}</p>
            </div>
            <div className={styles.infoSection}>
                <p className={styles.label}>Order</p>
                <p className={styles.value}>#{order.vendor_order_id || '1234'}</p>
            </div>
        </div>
    );

}