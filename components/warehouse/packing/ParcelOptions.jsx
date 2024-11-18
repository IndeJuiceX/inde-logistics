import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';

export default function ParcelOptions() {
  return (
    <div className={styles.parcelOptions}>
      <div className={`${styles.parcel} ${styles.small}`}>
        {/* eslint-disable-next-line */}
        <img
          src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
          alt="Small Parcel"
        />
        SMALL PARCEL
      </div>
      <div className={`${styles.parcel} ${styles.large}`}>
        {/* eslint-disable-next-line */}
        <img
          src="https://dev.indejuice.com/img/wh/parcel_large.png"
          alt="Large Parcel"
        />
        LARGE PARCEL
      </div>
      <div className={`${styles.parcel} ${styles.attention}`}>
        {/* eslint-disable-next-line */}
        <img
          src="https://dev.indejuice.com/img/wh/warning.png"
          alt="Attention"
        />
        <div>REQUIRES ATTENTION</div>
      </div>
    </div>
  );
}
