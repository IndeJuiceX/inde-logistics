'use client'

import { useState, useEffect } from "react";
import { useErrorAppContext } from "@/contexts/ErrorAppContext";
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import DialPad from "@/components/warehouse/keypad/DialPad";
import { getParcelDimensions } from "@/services/utils/warehouse/indePackageDimensions";


export default function PackageSize() {
    const { selectedParcelOption, setPayloadCourier, payloadCourier, updateWeightAndDimensions, currentOrderShipment, isGeneratedLabel } = useErrorAppContext();
    const [numberInput, setNumberInput] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [activeField, setActiveField] = useState('');


    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newNumberInput = numberInput.slice(0, -1);
            setNumberInput(newNumberInput);

        } else if (input === 'ok') {
            // On 'ok', reset activeField and numberInput
            setPayloadCourier(prevState => {
                const updatedCourier = { ...prevState, [activeField]: parseFloat(numberInput) };
                if (activeField === 'weight') {
                    updateWeightAndDimensions(updatedCourier);
                }
                return updatedCourier;
            });
            setNumberInput('');
            setIsOpenModal(false);
            if (activeField === 'weight') {

                setActiveField('');
                // updateWeightAndDimensions();
            }
        } else {
            const newNumberInput = numberInput + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setNumberInput(newNumberInput);

        }
    };

    useEffect(() => {
        const fetchParcelDimensions = async () => {
            const parcelDimensions = await getParcelDimensions(selectedParcelOption);
            setPayloadCourier(
                {
                    ...payloadCourier,
                    length: parcelDimensions.length,
                    width: parcelDimensions.width,
                    depth: parcelDimensions.depth

                });
        }
        if (selectedParcelOption !== 'custom') {
            fetchParcelDimensions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedParcelOption]);

    const handleFieldClick = async (field) => {
        if (isGeneratedLabel) return;

        setActiveField(field);
        if (selectedParcelOption !== 'custom') {
            if (field !== 'weight') {
                const parcelDimensions = await getParcelDimensions(selectedParcelOption);
                setPayloadCourier({ ...payloadCourier, [field]: parcelDimensions[field] });
            }
            else {
                setPayloadCourier({
                    ...payloadCourier,
                    weight: 0,
                    length: 0,
                    width: 0,
                    depth: 0
                });
                setIsOpenModal(true);
            }
        } else {
            setPayloadCourier({
                ...payloadCourier,
                weight: 0,
                length: 0,
                width: 0,
                depth: 0
            });
            setIsOpenModal(true);
        }
    }

    return (
        <>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('length')} >
                <div
                    type="text"
                    value="29.1cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    {payloadCourier['length'] || '0'}cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">LENGTH</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('width')} >
                <div
                    type="text"
                    value="19.5cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    {payloadCourier['width'] || '0'}cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">WIDTH</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('depth')} >
                <div
                    type="text"
                    value="2.4cm"
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    {payloadCourier['depth'] || '0'}cm
                </div>
                <span className="font-semibold text-gray-600 text-sm">HEIGHT</span>
            </div>
            <div className="bg-white p-4 rounded shadow flex items-center justify-between" onClick={() => handleFieldClick('weight')} >
                <div
                    type="text"
                    value={`${payloadCourier['weight'] || '0'}g`}
                    className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                >
                    {payloadCourier['weight'] || '0'}g
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