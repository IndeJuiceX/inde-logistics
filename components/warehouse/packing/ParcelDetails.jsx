'use client'
import React, { useEffect, useState } from "react";
import styles from "@/styles/warehouse/packing/ParcelDetails.module.scss";
import PackingKeyPad from "@/components/warehouse/packing/PackingKeyPad";
import { usePackingAppContext } from "@/contexts/PackingAppContext";

export default function ParcelDetails() {
    const { order, packedData, setPackedData } = usePackingAppContext();

    const [enteredValue, setEnteredValue] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentClicked, setCurrentClicked] = useState('');


    const handleCustomSize = (currentClick) => {
        if (currentClicked === currentClick) {
            setCurrentClicked('');
        } else {
            setCurrentClicked(currentClick);
        }
        setEnteredValue(0);
        setIsOpenModal(true);
    }

    useEffect(() => {
        if (enteredValue) {
            if (currentClicked === 'weight') {
                setPackedData({ ...packedData, weight: enteredValue });
            }
            else {
                setPackedData({ ...packedData, customSize: { ...packedData.customSize, [currentClicked]: enteredValue } });
            }
       
        }
    }, [enteredValue]);

    useEffect(() => {
        console.log('packedData', packedData);

    }, [packedData]);

    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={() => handleCustomSize('length')}>
                <div className={styles.detailValue}>{packedData.customSize.length}cm</div>
                <div className={styles.detailLabel}>LENGTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('width')}>
                <div className={styles.detailValue}>{packedData.customSize.width}cm</div>
                <div className={styles.detailLabel}>WIDTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('height')}>
                <div className={styles.detailValue}>{packedData.customSize.height}cm</div>
                <div className={styles.detailLabel}>HEIGHT</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('weight')}>
                <div className={styles.detailValue}>{packedData.weight}g</div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>
                    <img
                        src="https://dev.indejuice.com/img/wh/print.png"
                        alt="Letter"
                    />
                </div>
                <div className={styles.detailLabel}>LABEL</div>
            </div>

            <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
        </div>
    );
}
