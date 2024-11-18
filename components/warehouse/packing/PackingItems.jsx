import styles from '@/styles/warehouse/packing/PackingItems.module.scss';

// export default function PackingItems({ image, name, details, quantity }) {
//   return (
//     <div className={styles.productItem}>
//       <img src={image} alt={name} className={styles.productImage} />
//       <div className={styles.productDetails}>
//         <h3>{name}</h3>
//         <p>{details}</p>
//       </div>
//       <div className={styles.quantity}>x{quantity}</div>
//     </div>
//   );
// }
export default function PackingItems({ image, name, details, quantity }) {
    return (
        <div className={styles.productItem}>
            <img src={image} alt={name} className={styles.productImage} />
            <div className={styles.productDetails}>
                <h3>{name}</h3>
                <p>{details}</p>
            </div>
            <div className={styles.quantity}>x{quantity}</div>
        </div>
    );
}
