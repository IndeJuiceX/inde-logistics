'use client'
import React, { useEffect, useState } from "react";
import styles from "@/styles/warehouse/packing/ParcelDetails.module.scss";
import PackingKeyPad from "@/components/warehouse/packing/PackingKeyPad";
import { usePackingAppContext } from "@/contexts/PackingAppContext";
import LabelPrintButton from "@/components/warehouse/packing/LabelPrintButton";
export default function ParcelDetails() {
    const { order, packedData, setPackedData,  handleNumberEntered, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue, isValidForPrintLabel, setIsValidForPrintLabel } = usePackingAppContext();




    const handleCustomSize = (currentClick) => {
        setIsValidForPrintLabel(false);
        setPackedData(prevState => ({
            ...prevState,
            courier: {
                ...prevState.courier,
                [currentClick]: 0
            }
        }));
        if (currentClicked === currentClick) {
            setCurrentClicked('');
        } else {
            setCurrentClicked(currentClick);
        }
        setEnteredValue('');

        setIsOpenModal(true);
    }

    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={() => handleCustomSize('depth')}>
                <div className={styles.detailValue}>{packedData.courier.depth}cm</div>
                <div className={styles.detailLabel}>LENGTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('width')}>
                <div className={styles.detailValue}>{packedData.courier.width}cm</div>
                <div className={styles.detailLabel}>WIDTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('height')}>
                <div className={styles.detailValue}>{packedData.courier.length}cm</div>
                <div className={styles.detailLabel}>HEIGHT</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('weight')}>
                <div className={styles.detailValue}>{packedData.courier.weight}g</div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>
            
            {isValidForPrintLabel && (
                <LabelPrintButton styles={styles} />
            )}

            <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
        </div>
    );
}
