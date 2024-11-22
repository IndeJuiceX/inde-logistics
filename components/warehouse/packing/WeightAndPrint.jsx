'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import PackingKeyPad from '@/components/warehouse/packing/PackingKeyPad';

export default function WeightAndPrint() {
    const { order, packedData, setPackedData, handleLabelPrint } = usePackingAppContext();
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();

    const [enteredValue, setEnteredValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);

    const handleWeightChange = () => {
        setPackedData({ ...packedData, weight: 0 });
        setIsOpenModal(true);
    }

    const handleComplete = async () => {
        console.log('handleComplete');


    }
    useEffect(() => {
        console.log('enteredValue', enteredValue);
        setPackedData({ ...packedData, weight: enteredValue });
        // eslint-disable-next-line
    }, [enteredValue]);
    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={handleWeightChange}>
                <div className={styles.detailValue}>{packedData.weight ? packedData.weight : 0}<small>g</small></div>
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