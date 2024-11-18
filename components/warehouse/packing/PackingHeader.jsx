
import styles from '@/styles/warehouse/packing/PackingHeader.module.scss';

export default function PackingHeader() {

    return (
        <header className={styles.header}>
            <div className={styles.orderCount}>x4</div>
            <div className={styles.customerInfo}>
                <div>Neil Gardner</div>
                <span>CUSTOMER</span>
            </div>
            <div className={styles.orderDetails}>
                <span>INVITEXZZ</span>
                <span>48H DELIVERY</span>
                <span>#FT ORDER</span>
            </div>
        </header>
    );

}