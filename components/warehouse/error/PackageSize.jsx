'use client'

import { useState, useEffect } from "react";
import { useErrorAppContext } from "@/contexts/ErrorAppContext";
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import DialPad from "../keypad/DialPad";



export default function PackageSize() {
    const { selectedParcelOption, setPayloadCourier, payloadCourier } = useErrorAppContext();
    const [numberInput, setNumberInput] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [activeField, setActiveField] = useState('');

    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newNumberInput = numberInput.slice(0, -1);
            setNumberInput(newNumberInput);

        } else if (input === 'ok') {
            // On 'ok', reset activeField and numberInput
            setPayloadCourier({ ...payloadCourier, [selectedParcelOption]: numberInput });
            setNumberInput('');
        } else {
            const newNumberInput = numberInput + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setNumberInput(newNumberInput);
            // updateQuantity(activeField, parsedValue);
        }
    };

    useEffect(() => {
        console.log(payloadCourier);
    }, [payloadCourier]);

    const handleFieldClick = (field) => {
        setActiveField(field);
        setIsOpenModal(true);
    }

    return (
        <>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('length')} >
                <div
                    type="text"
                    value="29.1cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    29.1cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">LENGTH</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('width')} >
                <div
                    type="text"
                    value="19.5cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    19.5cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">WIDTH</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('height')} >
                <div
                    type="text"
                    value="2.4cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    2.4cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">HEIGHT</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('weight')} >
                <div
                    type="text"
                    value="174.5g"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    174.5g
                </div>
                <span className="font-semibold text-gray-600 text-sm">WEIGHT</span>
            </div>

            <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} statusClass={'newOrder'} >
                <div className="mb-6 w-64 h-16 bg-teal-300 rounded-md flex justify-center items-center text-white font-bold text-lg shadow-md" >{numberInput}</div>
                <DialPad onNumberEntered={handleNumberEntered} />
            </PickingAppModal>
        </>
    )
}