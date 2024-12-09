'use client'

import { usePackingAppContext } from "@/contexts/PackingAppContext";
import LabelPrintButton from "@/components/warehouse/packing/LabelPrintButton";
import PickedAndLabeled from "@/components/warehouse/packing/PickedAndLabeled";
import { ArrowLeftRight, ArrowUpDown, MoveVertical, Weight, Delete, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NumberPad from "./NumerPad";

export default function ParcelDetails() {
    const [flashingItem, setFlashingItem] = useState(null);
    const {
        order,
        packedData,
        setPackedData,
        currentClicked,
        setCurrentClicked,
        isValidForPrintLabel,
        setIsValidForPrintLabel,
        isGeneratedLabel,
        isReadyForDispatch,
        updateWeightAndDimensions
    } = usePackingAppContext();

    const handleCustomSize = (currentClick) => {
        if (isGeneratedLabel) return;
        setIsValidForPrintLabel(false);
        setCurrentClicked(currentClicked === currentClick ? '' : currentClick);
    }

    const handleValueChange = (dimension, value) => {
        const numValue = value.endsWith('.') ? value : (parseFloat(value) || 0);
        setPackedData(prevState => ({
            ...prevState,
            courier: {
                ...prevState.courier,
                [dimension]: numValue
            }
        }));
    }

    const handleConfirm = (dimension) => {
        setCurrentClicked('');
        setFlashingItem(dimension);
        setTimeout(() => setFlashingItem(null), 1000);
        if (currentClicked === 'weight') {
            updateWeightAndDimensions();
        }
    }

    const handleKeyPress = (dimension, key) => {
        const currentValue = (packedData?.courier?.[dimension] || '0').toString();

        let newValue;
        if (key === 'backspace') {
            newValue = currentValue.slice(0, -1) || '0';
        } else if (key === '.') {
            if (!currentValue.includes('.')) {
                newValue = currentValue + '.';
            } else {
                return;
            }
        } else {
            newValue = currentValue === '0' ? key : currentValue + key;
        }

        handleValueChange(dimension, newValue);
    }

    const depth = isGeneratedLabel ? order?.shipment?.length : packedData?.courier?.depth;
    const width = isGeneratedLabel ? order?.shipment?.width : packedData?.courier?.width;
    const length = isGeneratedLabel ? order?.shipment?.height : packedData?.courier?.length;
    const weight = isGeneratedLabel && order?.shipment?.weight_grams != null ? order.shipment.weight_grams : packedData?.courier?.weight;

    const DetailItem = ({ value, dimension, label, onClick, icon: Icon }) => (
        <div className="w-full space-y-2">
            <div
                className={cn(
                    "w-full rounded-lg bg-white shadow-sm border transition-all duration-300",
                    currentClicked === dimension ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
                    isGeneratedLabel ? 'cursor-default' : 'cursor-pointer'
                )}
            >
                <div
                    onClick={onClick}
                    className="w-full flex items-center justify-between p-6 relative"
                >
                    <div className="flex items-center gap-4">
                        <Icon className="text-gray-400 text-xl stroke-2" />
                        <div className="text-sm font-semibold text-gray-500 tracking-wider">{label}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-700">
                        {value || 0}{label === 'WEIGHT' ? 'g' : 'cm'}
                    </div>
                    {flashingItem === dimension && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Check className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
                        </div>
                    )}
                </div>
            </div>

            {currentClicked === dimension && !isGeneratedLabel && (
                <div className="w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-center mb-4">
                        {value || 0}{label === 'WEIGHT' ? 'g' : 'cm'}
                    </div>
                    <NumberPad onKeyPress={(key) => handleKeyPress(dimension, key)} />
                    <div className="mt-4">
                        <Button
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleConfirm(dimension)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Confirm
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full space-y-4 pt-4">
            {!isReadyForDispatch && (
                <div className="w-full space-y-4">
                    <DetailItem
                        value={depth}
                        dimension="depth"
                        label="LENGTH"
                        onClick={() => handleCustomSize('depth')}
                        icon={ArrowLeftRight}
                    />
                    <DetailItem
                        value={width}
                        dimension="width"
                        label="WIDTH"
                        onClick={() => handleCustomSize('width')}
                        icon={ArrowUpDown}
                    />
                    <DetailItem
                        value={length}
                        dimension="length"
                        label="HEIGHT"
                        onClick={() => handleCustomSize('length')}
                        icon={MoveVertical}
                    />
                </div>
            )}

            <DetailItem
                value={weight}
                dimension="weight"
                label="WEIGHT"
                onClick={() => handleCustomSize('weight')}
                icon={Weight}
            />

            {isValidForPrintLabel && <LabelPrintButton />}
            {isReadyForDispatch && <PickedAndLabeled />}
        </div>
    );
}
