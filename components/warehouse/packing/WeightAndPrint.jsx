'use client';

import React, { useState, useContext } from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import PackingKeyPad from '@/components/warehouse/packing/PackingKeyPad';

export default function WeightAndPrint() {
    const { order, packedData, setPackedData } = usePackingAppContext();
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();

    const [enteredValue, setEnteredValue] = useState(0);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const handleWeightChange = () => {
        setPackedData({ ...packedData, weight: 0 });
        setIsOpenModal(true);
    }

    const handleComplete = () => {
        console.log('handleComplete');
    }
    const handleLabelPrint = () => {
        console.log('handleLabelPrint');
        checkAllowedWeight();
    }
    const checkAllowedWeight = () => {
        const couriers = order.shipment.courier;
        let parcelType = '';
        if (packedData.parcelOption === 'letter') {
            parcelType = couriers.find(type => type.package_type === "large letter");
        }
        if (packedData.parcelOption === 'large' || packedData.parcelOption === 'extra') {
            parcelType = couriers.find(type => type.package_type === "parcel");
        }
        if (parcelType) {
            const maxWeight = parcelType.max_weight_g;
            if (enteredValue > maxWeight) {
                setPackedData({ ...packedData, parcelOption: '' });
                setEnteredValue(0);
                setIsErrorReload(false);
                setError(true);
                setErrorMessage(`Weight exceeds the limit of ${maxWeight}g. Please select the correct parcel type`);
            }
        }
    }
    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={handleWeightChange}>
                <div className={styles.detailValue}>{enteredValue}<small>g</small></div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
            </div>

            <div className={styles.detailItem} onClick={handleLabelPrint}>
                {/* eslint-disable-next-line */}
                <img
                    src="https://dev.indejuice.com/img/wh/print.png"
                    alt="Letter"
                />
                LABEL
            </div>

            <div className={styles.complete} onClick={handleComplete}>
                {/* eslint-disable-next-line */}
                <img
                    src="https://dev.indejuice.com/img/wh/label_added.png"
                    alt="Letter"
                />
                <span>PACKED & LABELLED</span>
            </div>


        </div>
    )
}