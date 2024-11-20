'use client';

import React, { useState, useContext } from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';
import DialPad from '@/components/warehouse/keypad/DialPad';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { useGlobalContext } from "@/contexts/GlobalStateContext";

export default function WeightAndPrint() {
    const { order, packedData, setPackedData } = usePackingAppContext();
    const { setError, setErrorMessage, isErrorReload, setIsErrorReload } = useGlobalContext();


    const [isOpenModal, setIsOpenModal] = useState(false);
    const [status, setStatus] = useState('newOrder');
    const [enteredValue, setEnteredValue] = useState(0);

    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newInput = enteredValue.length > 0 ? enteredValue.slice(0, -1) : '';
            setEnteredValue(newInput);
        } else if (input === 'ok') {
            checkAllowedWeight();
            setIsOpenModal(false);
        } else {
            const newNumberInput = enteredValue + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setEnteredValue(newNumberInput);
        }
    };

    const handleWeightChange = () => {
        setEnteredValue(0);
        setIsOpenModal(true);
    }

    const handleComplete = () => {
        console.log('handleComplete');
    }
    const checkAllowedWeight = () => {
        console.log('order checkAllowedWeight', order);
        const couriers = order.shipment.courier;
        let parcelType = '';
        if (packedData.parcelOption === 'letter') {
            parcelType = couriers.find(type => type.package_type === "large letter");
        }
        if(packedData.parcelOption === 'large' || packedData.parcelOption === 'extra') {
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
                <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} statusClass={status} >
                    <div className={styles.container}>
                        <div className={styles.calculator}>
                            <div className={styles.display}>{enteredValue}</div>
                            <DialPad onNumberEntered={handleNumberEntered} />
                        </div>
                    </div>
                </PickingAppModal>
            </div>

            <div className={styles.detailItem} >
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