'use client';

import { useErrorAppContext } from '@/contexts/ErrorAppContext';
import { getShippingDuration } from '@/services/utils';
export default function ErrorHeading() {
    const { totalErrorOrders, currentErrorOrderIndex, currentErrorOrder } = useErrorAppContext();

    const totalQuantities = currentErrorOrder?.items?.reduce((acc, item) => acc + item.quantity, 0);


    return (
        <header className="flex flex-wrap justify-between items-center bg-white px-6 py-4 shadow">
            <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                <span className="text-xl font-bold">x{totalQuantities ? totalQuantities : 0} ITEMS</span>
            </div>

            <div className="flex flex-col items-start w-full sm:w-auto mb-2 sm:mb-0">
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-semibold text-gray-500">{currentErrorOrder?.buyer?.name}</div>
            </div>

            <div className="flex flex-col items-start w-full sm:w-auto mb-2 sm:mb-0">
                <div className="text-sm text-gray-500">Delivery Type</div>
                <div className="text-sm text-gray-500">{currentErrorOrder?.shipping_code ? getShippingDuration(currentErrorOrder?.shipping_code) : '-'} DELIVERY</div>
            </div>

            <div className="flex flex-col items-start w-full sm:w-auto mb-2 sm:mb-0">
                <div className="text-sm text-gray-500">Order</div>
                <div className="font-semibold">{currentErrorOrder?.vendor_order_id}</div>
            </div>

            <div className="flex flex-col items-start w-full sm:w-auto mb-2 sm:mb-0">
                <div className="text-sm text-red-600 font-semibold">{currentErrorOrderIndex + 1} of {totalErrorOrders}</div>
                <div className="text-sm text-red-600 font-semibold "> IN QUEUE</div>
            </div>



            <div className="flex items-center w-full sm:w-auto">
                <div className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">≡</div>
            </div>
        </header>
    );
}