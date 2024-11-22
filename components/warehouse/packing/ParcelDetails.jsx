'use client'
import React, { useEffect, useState } from "react";
import styles from "@/styles/warehouse/packing/ParcelDetails.module.scss";
import PackingKeyPad from "@/components/warehouse/packing/PackingKeyPad";
import { usePackingAppContext } from "@/contexts/PackingAppContext";

export default function ParcelDetails() {
    const { order, packedData, setPackedData, handleLabelPrint } = usePackingAppContext();

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
        console.log('enteredValue', enteredValue);
        console.log('currentClicked', currentClicked);
        if (enteredValue) {
            if (currentClicked === 'weight') {
                setPackedData({ ...packedData, weight: enteredValue });
            }
            else {
                setPackedData({ ...packedData, custom_dimensions: { ...packedData.custom_dimensions, [currentClicked]: enteredValue } });
            }

        }
        // eslint-disable-next-line
    }, [enteredValue]);

    useEffect(() => {
        console.log('packedData', packedData);

    }, [packedData]);

    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={() => handleCustomSize('depth')}>
                <div className={styles.detailValue}>{packedData.custom_dimensions.depth}cm</div>
                <div className={styles.detailLabel}>LENGTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('width')}>
                <div className={styles.detailValue}>{packedData.custom_dimensions.width}cm</div>
                <div className={styles.detailLabel}>WIDTH</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('height')}>
                <div className={styles.detailValue}>{packedData.custom_dimensions.height}cm</div>
                <div className={styles.detailLabel}>HEIGHT</div>
            </div>
            <div className={styles.detailItem} onClick={() => handleCustomSize('weight')}>
                <div className={styles.detailValue}>{packedData.weight}g</div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>
                    {/* eslint-disable-next-line */}
                    <img
                        src="https://dev.indejuice.com/img/wh/print.png"
                        alt="Letter"
                    />
                </div>
                <div className={styles.detailLabel} onClick={handleLabelPrint}>LABEL</div>
            </div>

            <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
        </div>
    );
}
