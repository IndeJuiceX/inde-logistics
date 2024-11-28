'use client';

import React  from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import PackingKeyPad from '@/components/warehouse/packing/PackingKeyPad';
import LabelPrintButton from '@/components/warehouse/packing/LabelPrintButton';
import OrderDispatch from '@/components/warehouse/packing/OrderDispatch';
export default function WeightAndPrint() {
    const { order, packedData, setPackedData, isOpenModal, setIsOpenModal, enteredValue, setEnteredValue, setCurrentClicked, currentClicked, isValidForPrintLabel, setIsValidForPrintLabel, isReadyForDispatch, isGeneratedLabel } = usePackingAppContext();
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();

    const handleWeightChange = () => {
        if (isGeneratedLabel) {
            return;
        }
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

   
   
    const weight = isGeneratedLabel ? order?.shipment?.weight_grams : packedData?.courier?.weight;
    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={handleWeightChange}>
                <div className={styles.detailValue}>{weight ? weight : 0}<small>g</small></div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
            </div>
            {(isValidForPrintLabel || isGeneratedLabel) && (
                <LabelPrintButton styles={styles} />
            )}
            {isReadyForDispatch && (
                <OrderDispatch />
            )}


        </div>
    )
}