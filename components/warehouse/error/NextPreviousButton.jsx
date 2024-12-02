'use client';

import { useErrorAppContext } from '@/contexts/ErrorAppContext';

export default function NextPreviousButton() {
    const { currentErrorOrderIndex, setCurrentErrorOrderIndex, totalErrorOrders } = useErrorAppContext();

    const handlePrevious = () => {
        if (currentErrorOrderIndex > 0) {
            setCurrentErrorOrderIndex(currentErrorOrderIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentErrorOrderIndex < totalErrorOrders - 1) {
            setCurrentErrorOrderIndex(currentErrorOrderIndex + 1);
        }
    };

    return (
        <div className="flex items-center justify-between w-1/2">
            <button className="bg-white p-4 rounded shadow hover:bg-gray-300" onClick={handlePrevious} disabled={currentErrorOrderIndex === 0}>
                {/* eslint-disable-next-line */}
                <img src="https://dev.indejuice.com/img/pager/arrow_prev_red.png" alt="Previous" className="h-6 w-6" />
            </button>
            <button className="bg-white p-4 rounded shadow hover:bg-gray-300" onClick={handleNext} disabled={currentErrorOrderIndex === totalErrorOrders - 1}>
                {/* eslint-disable-next-line */}
                <img src="https://dev.indejuice.com/img/pager/arrow_next_red.png" alt="Next" className="h-6 w-6" />
            </button>
        </div>
    );
}