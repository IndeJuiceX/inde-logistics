'use client';
import React from 'react';
import styles from '@/styles/warehouse/packing/ParcelOptions.module.scss';
import ParcelDetails from '@/components/warehouse/packing/ParcelDetails';
import WeightAndPrint from '@/components/warehouse/packing/WeightAndPrint';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { FaCog } from 'react-icons/fa';

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
          <div className={`${styles.parcel} ${styles.letter} ${packedData.parcelOption === 'letter' ? styles.selected : ''}`} onClick={() => handleParcelOptionClick('letter')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
              alt="Letter"
            />
            LETTER
          </div>
        )}
        {(packedData.parcelOption === '' || packedData.parcelOption === 'parcel') && (
          <div className={`${styles.parcel} ${styles.parcel} ${packedData.parcelOption === 'parcel' ? styles.selected : ''}`} onClick={() => handleParcelOptionClick('parcel')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Parcel"
            />
            PARCEL
          </div>
        )}
        {(packedData.parcelOption === '' || packedData.parcelOption === 'extra_parcel') && (
          <div className={`${styles.parcel} ${styles.extraLarge} ${packedData.parcelOption === 'extra_parcel' ? styles.selected : ''}`} onClick={() => handleParcelOptionClick('extra_parcel')}>
            {/* eslint-disable-next-line */}
            <img
              src="https://dev.indejuice.com/img/wh/parcel_large.png"
              alt="Extra Large Parcel"
            />
            EXTRA LARGE PARCEL
          </div>
        )}
        {packedData.parcelOption === 'custom' && (

          <div className={`${styles.parcel} ${styles.customSize} ${packedData.parcelOption === 'custom' ? styles.selected : ''}`} onClick={() => handleParcelOptionClick('custom')}>
            <FaCog alt="Settings" />
            CUSTOM SIZE
          </div>

        )}
      </div>

      {packedData.parcelOption !== '' && (packedData.parcelOption.includes('letter') || packedData.parcelOption.includes('parcel') || packedData.parcelOption.includes('extra_parcel')) ? (
        <WeightAndPrint />
      ) : packedData.parcelOption === 'custom' && (
        <ParcelDetails />
      )}
      {/* {packedData.parcelOption === '' && ( */}
      <div className={` ${styles.action}`}>
        <div className={`${styles.action} ${styles.customSize} `} onClick={() => handleParcelOptionClick('custom')}>
          <FaCog alt="Settings" />
          CUSTOM
        </div>
        <div className={`${styles.action} ${styles.customSize} `}>

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
