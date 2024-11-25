'use client';

import React, { useState } from 'react';
import styles from '@/styles/warehouse/packing/PackingKeyPad.module.scss';
import DialPad from '@/components/warehouse/keypad/DialPad';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { usePackingAppContext } from '@/contexts/PackingAppContext';

export default function PackingKeyPad() {
    const { order, packedData, setPackedData, handleNumberEntered, isOpenModal, setIsOpenModal, enteredValue, setEnteredValue } = usePackingAppContext();

    const [status, setStatus] = useState('newOrder');
    // const [enteredValue, setEnteredValue] = useState(0);

    // const handleNumberEntered = (input) => {
    //     if (input === 'backspace') {
    //         const newInput = enteredValue.length > 0 ? enteredValue.slice(0, -1) : '';
    //         setEnteredValue(newInput);
    //     } else if (input === 'ok') {
    //         // setPackedData({ ...packedData, weight: enteredValue }); // This is the line that is causing the error
    //         setIsOpenModal(false);
    //     } else {
    //         const newNumberInput = enteredValue + input;
    //         const parsedValue = parseInt(newNumberInput, 10);
    //         setEnteredValue(newNumberInput);
    //     }
    // };

    return (
        <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} statusClass={status} >
            <div className={styles.container}>
                <div className={styles.calculator}>
                    <div className={styles.display}>{enteredValue}</div>
                    <DialPad onNumberEntered={handleNumberEntered} />
                </div>
            </div>
        </PickingAppModal>
    )

}