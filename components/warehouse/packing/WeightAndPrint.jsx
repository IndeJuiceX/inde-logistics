'use client';

import React, { useState } from 'react';
import styles from '@/styles/warehouse/packing/WeightAndPrint.module.scss';
import DialPad from '@/components/warehouse/keypad/DialPad';
import PickingAppModal from '../modal/PickingAppModal';

export default function WeightAndPrint() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [status, setStatus] = useState('newOrder');
    const [enteredValue, setEnteredValue] = useState(0);

    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newInput = enteredValue.length > 0 ? enteredValue.slice(0, -1) : '';
            setEnteredValue(newInput);
        } else if (input === 'ok') {
            // On 'ok', reset activeField and numberInput
            setIsOpenModal(false);
        } else {
            const newNumberInput = enteredValue + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setEnteredValue(newNumberInput);
        }
    };

    const handleWeightChange = () => {
        setIsOpenModal(true);
    }

    const handleComplete = () => {
        console.log('handleComplete');
        
    }
    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem} onClick={handleWeightChange}>
                <div className={styles.detailValue}>{enteredValue}<small>cm</small></div>
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