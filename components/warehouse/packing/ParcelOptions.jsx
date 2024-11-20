'use client';
import React from 'react';
import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';
import ParcelDetails from '@/components/warehouse/packing/ParcelDetails';
import WeightAndPrint from '@/components/warehouse/packing/WeightAndPrint';
import { usePackingAppContext } from '@/contexts/PackingAppContext';

export default function ParcelOptions() {
  const { order, packedData, setPackedData } = usePackingAppContext();

  const handleParcelOptionClick = (parcelOption) => {
    const selectedOption = parcelOption === packedData.parcelOption ? '' : parcelOption;
    setPackedData({ ...packedData, parcelOption: selectedOption });
  }
  return (
    <div className={styles.parcelOptions}>

      <div className={styles.upperSection}>
        {(packedData.parcelOption === '' || packedData.parcelOption === 'letter') && (
          <div className={`${styles.parcel} ${styles.letter}`} onClick={() => handleParcelOptionClick('letter')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
              alt="Letter"
            />
            LETTER
          </div>
        )}
        {(packedData.parcelOption === '' || packedData.parcelOption === 'large') && (
          <div className={`${styles.parcel} ${styles.parcel}`} onClick={() => handleParcelOptionClick('large')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Parcel"
            />
            PARCEL
          </div>
        )}
        {(packedData.parcelOption === '' || packedData.parcelOption === 'extra') && (
          <div className={`${styles.parcel} ${styles.extraLarge}`} onClick={() => handleParcelOptionClick('extra')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Extra Large Parcel"
            />
            EXTRA LARGE PARCEL
          </div>
        )}
        {(packedData.parcelOption === '' || packedData.parcelOption === 'custom') && (

          <div className={`${styles.parcel} ${styles.customSize}`} onClick={() => handleParcelOptionClick('custom')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Extra Large Parcel"
            />
            CUSTOM SIZE
          </div>

        )}



      </div>

      {packedData.parcelOption !== '' && (packedData.parcelOption.includes('letter') || packedData.parcelOption.includes('large') || packedData.parcelOption.includes('extra')) ? (
        <WeightAndPrint />
      ) : packedData.parcelOption === 'custom' && (
        <ParcelDetails />
      )}
      {/* {packedData.parcelOption === '' && ( */}
      <div className={`${styles.parcel} ${styles.customSize}`}>
        {/* eslint-disable-next-line */}
        <img
          src="https://dev.indejuice.com/img/wh/warning.png"
          alt="Extra Large Parcel"
        />
        REPORT
      </div>
      {/* )} */}
    </div>
  );
}
