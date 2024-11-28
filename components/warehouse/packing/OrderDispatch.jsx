'use client';
import styles from '@/styles/warehouse/packing/OrderDispatch.module.scss';
import { usePackingAppContext } from '@/contexts/PackingAppContext';

export default function OrderDispatch() {
    const { handleComplete } = usePackingAppContext();
    return (
        <div className={styles.complete} onClick={handleComplete}>
            {/* eslint-disable-next-line */}
            <img
                src="https://dev.indejuice.com/img/wh/label_added.png"
                alt="Letter"
            />
            <span>PACKED & LABELLED</span>
        </div>
    )
}