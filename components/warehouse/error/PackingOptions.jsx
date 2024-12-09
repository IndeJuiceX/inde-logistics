'use client';

import { useErrorAppContext } from '@/contexts/ErrorAppContext';
import { FaCog } from 'react-icons/fa';

export default function PackingOptions() {

    const { selectedParcelOption, setSelectedParcelOption } = useErrorAppContext();

    const handleParcelOptionClick = (option) => {
        const updateParcelOption = selectedParcelOption === option ? '' : option;
        setSelectedParcelOption(updateParcelOption);
    }


    return (
        <div className="space-y-4">
            {(selectedParcelOption === '' || selectedParcelOption === 'letter') && (
                <div className={`bg-white p-4 rounded shadow flex items-center space-x-4 gap-6 ${selectedParcelOption === 'letter' ? 'border-2 border-green-500' : ''}`} onClick={() => handleParcelOptionClick('letter')}>
                    {/* eslint-disable-next-line */}
                    <img src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2" alt="Letter" className="h-16 w-auto" />
                    <span className="text-base font-semibold text-gray-700">Letter</span>
                </div>
            )}

            {(selectedParcelOption == '' || selectedParcelOption == 'parcel') && (
                <div className={`bg-white p-4 rounded shadow flex items-center space-x-4 ${selectedParcelOption === 'parcel' ? 'border-2 border-green-500' : ''}`} onClick={() => handleParcelOptionClick('parcel')}>
                    {/* eslint-disable-next-line */}
                    <img src="https://dev.indejuice.com/img/wh/parcel_large.png" alt="Parcel" className="h-16 w-auto" />
                    <span className="text-base font-semibold text-gray-700">Parcel</span>
                </div>
            )}

            {(selectedParcelOption == '' || selectedParcelOption == 'extra_large_parcel') && (
                <div className={`bg-white p-4 rounded shadow flex items-center space-x-4 ${selectedParcelOption === 'extra_large_parcel' ? 'border-2 border-green-500' : ''}`} onClick={() => handleParcelOptionClick('extra_large_parcel')}>
                    {/* eslint-disable-next-line */}
                    <img src="https://dev.indejuice.com/img/wh/parcel_large.png" alt="Extra Parcel" className="h-16 w-auto" />
                    <span className="text-base font-semibold text-gray-700">Extra Parcel</span>
                </div>
            )}

            {(selectedParcelOption == '' || selectedParcelOption == 'custom') && (
                <div className={`bg-white p-4 rounded shadow flex items-center space-x-4 ${selectedParcelOption === 'custom' ? 'border-2 border-green-500' : ''}`} onClick={() => handleParcelOptionClick('custom')}>
                    {/* eslint-disable-next-line */}

                    <FaCog alt="Settings" />
                    <span className="text-base font-semibold text-gray-700">Custom Size</span>
                </div>
            )}
        </div>
    )
}