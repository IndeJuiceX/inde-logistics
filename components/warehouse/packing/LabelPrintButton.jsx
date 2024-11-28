'use client';
import { usePackingAppContext } from '@/contexts/PackingAppContext';

export default function LabelPrintButton({ styles }) {
    const { printLabel } = usePackingAppContext();
    return (
        <div className={styles.detailItem} onClick={printLabel}>
            {/* eslint-disable-next-line */}
            <img
                src="https://dev.indejuice.com/img/wh/print.png"
                alt="Letter"
            />
            LABEL
        </div>
    )
}