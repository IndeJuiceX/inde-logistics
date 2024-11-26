'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import PackingKeyPad from '@/components/warehouse/packing/PackingKeyPad';
import LabelPrintButton from '@/components/warehouse/packing/LabelPrintButton';
export default function WeightAndPrint() {
    const { order, packedData, setPackedData, handleLabelPrint, handleNumberEntered, isOpenModal, setIsOpenModal, enteredValue, setEnteredValue, setCurrentClicked, currentClicked, isValidForPrintLabel, setIsValidForPrintLabel, isReadyForDispatch } = usePackingAppContext();
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();

    const handleWeightChange = () => {
        setIsValidForPrintLabel(false);
        setCurrentClicked('weight');
        setPackedData(prevState => ({
            ...prevState,
            courier: {
                ...prevState.courier,
                weight: 0
            }
        }));
        setEnteredValue('');
        setIsOpenModal(true);
    }

    const handleComplete = async () => {
        console.log('handleComplete');


    }

    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={handleWeightChange}>
                <div className={styles.detailValue}>{packedData.courier.weight ? packedData.courier.weight : 0}<small>g</small></div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
            </div>
            {isValidForPrintLabel && (
                <LabelPrintButton styles={styles} />
            )}
            {isReadyForDispatch && (
                <div className={styles.complete} onClick={handleComplete}>
                    {/* eslint-disable-next-line */}
                    <img
                        src="https://dev.indejuice.com/img/wh/label_added.png"
                        alt="Letter"
                    />
                    <span>PACKED & LABELLED</span>
                </div>
            )}


        </div>
    )
}