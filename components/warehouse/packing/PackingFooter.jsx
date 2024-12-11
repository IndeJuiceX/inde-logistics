'use client';


import { useState } from 'react';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { extractNameFromEmail } from '@/services/utils';

export default function PackingFooter() {
    const { order, setOrder, isErrorQueue, orderData, currentErrorIndex, setCurrentIndex, totalErrorOrders } = usePackingAppContext();


    const email = order?.shipment?.packer ?? null;
    const name = email ? extractNameFromEmail(email) : 'Ali B';

    const handlePrevious = () => {
        if (currentErrorIndex > 0) {
            const currentOrder = orderData[currentErrorIndex - 1];
            setOrder(currentOrder);
            setCurrentIndex(currentErrorIndex - 1);
        }
    };

    const handleNext = () => {

        if (orderData && currentErrorIndex < totalErrorOrders - 1) {
            const nextOrderIndex = currentErrorIndex + 1;
            const nextOrder = orderData[nextOrderIndex];
            setCurrentIndex(nextOrderIndex);
            setOrder(nextOrder);
        }
    };



    return (
        <footer className="bg-slate-100 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-2 px-4 flex justify-between items-center h-[60px]">
            <div>
                <p className="font-semibold text-sm">{name}</p>
            </div>
            {isErrorQueue && (
                <div className="mt-2">
                    <button className="bg-white p-4 rounded shadow hover:bg-gray-300" onClick={handlePrevious}>
                        {/* eslint-disable-next-line */}
                        <img src="https://dev.indejuice.com/img/pager/arrow_prev_red.png" alt="Previous" className="h-6 w-6" />
                    </button>
                    <button className="bg-white p-4 rounded shadow hover:bg-gray-300" onClick={handleNext}>
                        {/* eslint-disable-next-line */}
                        <img src="https://dev.indejuice.com/img/pager/arrow_next_red.png" alt="Next" className="h-6 w-6" />
                    </button>
                </div>
            )}
        </footer>
    );
}