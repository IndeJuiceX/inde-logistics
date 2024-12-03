'use client';

import { useErrorAppContext } from '@/contexts/ErrorAppContext';

export default function NextPreviousButton() {
    const { errorOrders, currentErrorOrderIndex, setCurrentErrorOrderIndex, totalErrorOrders, setCurrentErrorOrder } = useErrorAppContext();

    const handlePrevious = () => {
        if (currentErrorOrderIndex > 0) {
            const previousOrder = errorOrders[currentErrorOrderIndex - 1];
            setCurrentErrorOrderIndex(currentErrorOrderIndex - 1);
            setCurrentErrorOrder(previousOrder);
        }
    };

    const handleNext = () => {
        console.log('currentErrorOrderIndex', currentErrorOrderIndex);
        console.log('currentErrorOrderIndex', currentErrorOrderIndex);
        if (errorOrders && currentErrorOrderIndex < totalErrorOrders - 1) { // Added check for errorOrders
            const nextOrderIndex = currentErrorOrderIndex + 1;
            console.log('nextOrderIndex', nextOrderIndex);
            const nextOrder = errorOrders[nextOrderIndex];
            console.log('nextOrder', nextOrder);
            setCurrentErrorOrderIndex(nextOrderIndex);
            setCurrentErrorOrder(nextOrder);
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