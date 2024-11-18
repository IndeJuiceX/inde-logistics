import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';

// export default function ParcelOptions() {
//   return (
//     <div className={styles.parcelOptions}>
//       <div className={`${styles.parcel} ${styles.small}`}>SMALL PARCEL</div>
//       <div className={`${styles.parcel} ${styles.large}`}>LARGE PARCEL</div>
//       <div className={styles.attention}>REQUIRES ATTENTION</div>
//     </div>
//   );
// }
export default function ParcelOptions() {
    return (
      <div className={styles.parcelOptions}>
        <div className={`${styles.parcel} ${styles.small}`}>SMALL PARCEL</div>
        <div className={`${styles.parcel} ${styles.large}`}>LARGE PARCEL</div>
        <div className={styles.attention}>REQUIRES ATTENTION</div>
      </div>
    );
  }
