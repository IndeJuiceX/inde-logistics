
import styles from '@/styles/warehouse/packing/PackingHeader.module.scss';

export default function PackingHeader() {

    return (
        // <div className={styles.header}>
        //     <div className={styles.orderCount}>x4</div>
        //     <div className={styles.customerInfo}>
        //         <div>Neil Gardner</div>
        //         <div>CUSTOMER</div>
        //     </div>
        //     <div className={styles.orderDetails}>
        //         <div>INVITEXZZ</div>
        //         <div>48H DELIVERY</div>
        //         <div>#FT ORDER</div>
        //     </div>
        // </div>
        <div className={styles.header}>
            <div className={styles.orderCount}>x4</div>
            <div className={styles.customerInfo}>
                <div>Neil Gardner</div>
                <div>CUSTOMER</div>
            </div>
            <div className={styles.orderDetails}>
                <div>INVITEXZZ</div>
                <div>48H DELIVERY</div>
                <div>#FT ORDER</div>
            </div>
        </div>
    );

}