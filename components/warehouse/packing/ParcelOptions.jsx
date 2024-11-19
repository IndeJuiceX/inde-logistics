import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';

export default function ParcelOptions() {
  return (
    <div className={styles.parcelOptions}>
      <div className={styles.upperSection}>
        <div className={`${styles.parcel} ${styles.letter}`}>
          {/* eslint-disable-next-line */}
          <img
            src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
            alt="Letter"
          />
          LETTER
        </div>
        <div className={`${styles.parcel} ${styles.parcel}`}>
          {/* eslint-disable-next-line */}
          <img
            src="https://dev.indejuice.com/img/wh/parcel_large.png"
            alt="Parcel"
          />
          PARCEL
        </div>
        <div className={`${styles.parcel} ${styles.extraLarge}`}>
          {/* eslint-disable-next-line */}
          <img
            src="https://dev.indejuice.com/img/wh/parcel_large.png"
            alt="Extra Large Parcel"
          />
          EXTRA LARGE PARCEL
        </div>
        <div className={`${styles.parcel} ${styles.customSize}`}>
          {/* eslint-disable-next-line */}
          <img
            src="https://dev.indejuice.com/img/wh/parcel_large.png"
            alt="Extra Large Parcel"
          />
          CUSTOM SIZE
        </div>
        <div className={`${styles.parcel} ${styles.customSize}`}>
          {/* eslint-disable-next-line */}
          <img
            src="https://dev.indejuice.com/img/wh/warning.png"
            alt="Extra Large Parcel"
          />
          REPORT
        </div>
      </div>
      
    </div>
  );
}
