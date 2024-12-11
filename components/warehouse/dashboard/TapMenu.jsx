'use client'

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import styles from '@/styles/warehouse/stock-app/menu.module.scss';
import { doLogOut } from '@/app/actions';

export default function TapMenu() {
    const { vendor_id } = useParams();
    const pathname = usePathname();
    const activePage = pathname.split("/").find(part => ['stocks', 'shipments', 'unshelved'].includes(part));

    const handleLogout = async () => {
        await doLogOut();
    }

    return (
        <div className={styles.menuContainer}>
            <Link
                href={`/warehouse/${vendor_id}/stocks`}
                className={`${styles.menuLink} ${activePage === 'stocks' ? styles.menuLinkActive : ''
                    }`}
            >
                STOCK
            </Link>

            <Link
                href={`/warehouse/${vendor_id}/shipments`}
                className={`${styles.menuLink} ${activePage === 'shipments' ? styles.menuLinkActive : ''
                    }`}
            >
                SHIPMENTS
            </Link>

            <Link
                href={`/warehouse/${vendor_id}/unshelved`}
                className={`${styles.menuLink} ${activePage === 'unshelved' ? styles.menuLinkActive : ''
                    }`}
            >
                UNSHELVED
            </Link>

            <button className={styles.logout} onClick={handleLogout}>
                <span className={styles.statusCircle}></span>
                <span>LOGOUT</span>
            </button>
        </div>
    );
}