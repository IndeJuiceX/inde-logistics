import Link from "next/link";
import styles from '@/styles/warehouse/stock-app/shipmentHeader.module.scss';
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

export default function ShipmentHeader({ vendor, shipmentDetails, url = 'shipments' }) {
    return (
        <div className={styles.header}>
            <div className={styles.headerContainer}>
                <div className={styles.leftSection}>
                    <Link className={styles.backButton} href={`/warehouse/${vendor.vendor_id}/${url}`}>
                        <ArrowLeftCircleIcon className={styles.backIcon} />
                    </Link>
                    <div className={styles.breadcrumb}>
                        <span className={styles.vendorName}>{vendor?.company_name}</span> {'>'}
                        <span className={styles.shipmentId}>Shipment #{shipmentDetails?.shipment_id}</span>
                    </div>
                </div>
                <button className={styles.clearButton}>
                    CLEAR
                </button>
            </div>
        </div>
    )
}