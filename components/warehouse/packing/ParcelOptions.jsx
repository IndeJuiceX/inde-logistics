'use client';
import React, { useState } from 'react';
import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';
import ParcelDetails from '@/components/warehouse/packing/ParcelDetails';
import WeightAndPrint from '@/components/warehouse/packing/WeightAndPrint';

export default function ParcelOptions() {

  const [selectedParcelOption, setSelectedParcelOption] = useState('');

  const handleParcelOptionClick = (parcelOption) => {
    console.log('handleParcelOptionClick', parcelOption);

    setSelectedParcelOption(parcelOption);
  }
  return (
    <div className={styles.parcelOptions}>
      {selectedParcelOption === '' && (
        <div className={styles.upperSection}>
          <div className={`${styles.parcel} ${styles.letter}`} onClick={() => handleParcelOptionClick('letter')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
              alt="Letter"
            />
            LETTER
          </div>
          <div className={`${styles.parcel} ${styles.parcel}`} onClick={() => handleParcelOptionClick('large')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Parcel"
            />
            PARCEL
          </div>
          <div className={`${styles.parcel} ${styles.extraLarge}`} onClick={() => handleParcelOptionClick('extra')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Extra Large Parcel"
            />
            EXTRA LARGE PARCEL
          </div>
          <div className={`${styles.parcel} ${styles.customSize}`} onClick={() => handleParcelOptionClick('custom')}>
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
      )}
      <div>
        {selectedParcelOption !== '' && (selectedParcelOption.includes('letter') || selectedParcelOption.includes('large') || selectedParcelOption.includes('extra')) ? (
          <WeightAndPrint />
        ) : selectedParcelOption === 'custom' && (
          <ParcelDetails />
        )}
      </div>

    </div>
  );
}
