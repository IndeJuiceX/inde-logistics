
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
        // <div className={styles.headerSection}>
        //     <div className={styles.orderCode}>X10</div>
        //     <div className={styles.infoSection}>
        //         <p className={styles.label}>Customer</p>
        //         <p className={styles.value}>G M</p>
        //     </div>
        //     <div className={styles.infoSection}>
        //         <p className={styles.label}>Delivery</p>
        //         <p className={styles.value}>24</p>
        //     </div>
        //     <div className={styles.infoSection}>
        //         <p className={styles.label}>Order</p>
        //         <p className={styles.value}>#1234</p>
        //     </div>
        // </div>
    );

}