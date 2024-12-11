'use client';
import React, { useState } from 'react';
import { Mail, Package, Settings2, Check, Loader } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import NumberPad from './NumerPad';
import ParcelDetails from './ParcelDetails';
import LabelPrintButton from './LabelPrintButton';
import PickedAndLabeled from './PickedAndLabeled';
import RequireAttention from '@/components/warehouse/packing/RequireAttention';
import { useGlobalContext } from '@/contexts/GlobalStateContext';

export default function ParcelOptions({ packingContext, globalContext }) {
  const {
    packedData,
    setPackedData,
    isGeneratedLabel,
    updateWeightAndDimensions,
    isValidForPrintLabel,
    isReadyForDispatch,
    isErrorQueue
  } = packingContext;
  const { loading } = globalContext;

  const [currentClicked, setCurrentClicked] = useState('');


  const handleParcelOptionClick = (parcelOption) => {
    if (isGeneratedLabel) {
      setPackedData({ ...packedData, parcelOption: parcelOption });
    } else {
      const selectedOption = parcelOption === packedData.parcelOption ? '' : parcelOption;
      setPackedData({ ...packedData, parcelOption: selectedOption });
      setCurrentClicked(parcelOption);
    }
  };

  const handleWeightInput = (key) => {
    setPackedData((prev) => {
      const currentWeight = prev.courier.weight || '0';
      let newWeight;

      if (key === 'backspace') {
        newWeight = currentWeight.slice(0, -1) || '0';
      } else {
        newWeight = currentWeight === '0' ? key : currentWeight + key;
      }

      return {
        ...prev,
        courier: { ...prev.courier, weight: newWeight },
      };
    });
  };

  const handleWeightConfirm = async () => {
    await updateWeightAndDimensions();
    setCurrentClicked('');
  };

  return (
    // 
    <div className={`flex flex-col items-center p-2.5   h-full ${isErrorQueue ? 'bg-red-500' : 'bg-[#b2f4d3]'}`}>
      <div className="w-full space-y-4">
        {(packedData.parcelOption === '' || packedData.parcelOption === 'letter') && (
          <Card
            className={`${packedData.parcelOption === 'letter' ? 'h-[90px]' : 'h-[166px]'} 
                       hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
            onClick={() => handleParcelOptionClick('letter')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-3">
              <Mail
                className="h-16 w-16 text-[#cd9c71]"
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
              <span className="font-bold">LETTER</span>
            </CardContent>
          </Card>
        )}

        {(packedData.parcelOption === '' || packedData.parcelOption === 'parcel') && (
          <Card
            className={`${packedData.parcelOption === 'parcel' ? 'h-[90px]' : 'h-[166px]'} 
                       hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
            onClick={() => handleParcelOptionClick('parcel')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-3">
              <Package
                className="h-16 w-16 text-[#cd9c71]"
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
              <span className="font-bold">PARCEL</span>
            </CardContent>
          </Card>
        )}

        {(packedData.parcelOption === '' || packedData.parcelOption === 'extra_large_parcel') && (
          <Card
            className={`${packedData.parcelOption === 'extra_large_parcel' ? 'h-[90px]' : 'h-[166px]'} 
                       hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
            onClick={() => handleParcelOptionClick('extra_large_parcel')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-3">
              <Package
                className="h-16 w-16 text-[#cd9c71] transform scale-x-150"
                fill="currentColor"
                stroke="white"
                strokeWidth={1.5}
              />
              <span className="font-bold">EXTRA LARGE PARCEL</span>
            </CardContent>
          </Card>
        )}

        {packedData.parcelOption !== '' && (packedData.parcelOption.includes('letter') || packedData.parcelOption.includes('parcel') || packedData.parcelOption.includes('extra_large_parcel')) ? (
          <>
            <div className="w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-center mb-4">
                {packedData.courier.weight || 0}g
              </div>
              <NumberPad onKeyPress={handleWeightInput} />
              <div className="mt-4">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleWeightConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Loading...' : 'Confirm'}
                </Button>
              </div>
            </div>

            {(isValidForPrintLabel || isGeneratedLabel) && (
              <LabelPrintButton />
            )}
            {isReadyForDispatch && (
              <PickedAndLabeled />
            )}
          </>
        ) : packedData.parcelOption === 'custom' && (
          <ParcelDetails />
        )}
      </div>

      <div className="flex w-full gap-4 mt-auto">
        <div
          className="flex items-center justify-center gap-3 p-4 rounded-lg text-center font-bold cursor-pointer 
                     bg-white h-[70px] flex-1 border border-gray-200 shadow-sm hover:border-blue-500 
                     transition-all duration-300 group"
          onClick={() => handleParcelOptionClick('custom')}
        >
          <Settings2
            className="w-6 h-6 text-gray-400 transition-transform group-hover:scale-110"
            strokeWidth={2}
          />
          <span className="text-gray-700 tracking-wide">CUSTOM</span>
        </div>
        <RequireAttention />
      </div>
    </div>
  );
}
