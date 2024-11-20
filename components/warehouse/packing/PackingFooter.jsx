'use client';

import styles from '@/styles/warehouse/packing/PackingFooter.module.scss';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { extractNameFromEmail } from '@/services/utils';


export default function PackingFooter() {
    const { order } = usePackingAppContext();
    const email = order?.shipment?.packer ?? null;
    const name = email ? extractNameFromEmail(email) : 'Ali B';

    return (
        <footer className={styles.footer} >
            <div className={styles.name}>{name}</div>
        </footer>
    );
}