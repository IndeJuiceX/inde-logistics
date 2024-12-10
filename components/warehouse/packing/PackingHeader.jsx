'use client';

import { usePackingAppContext } from '@/contexts/PackingAppContext';

export default function PackingHeader() {
    const { order, isErrorQueue, currentErrorIndex, totalErrorOrders } = usePackingAppContext();
    const couriers = order?.shipment?.courier;
    const shipmentCode = couriers[0]?.shipping_code;
    const shippingCode = shipmentCode?.split('-')[1];
    const quantity = order?.items?.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="bg-slate-100 shadow-md py-2 px-4 relative z-10">
            <div className="flex justify-between items-center">
                <div className="px-10 py-1 rounded-lg bg-black transition-colors duration-200 -ml-5">
                    <span className="text-sm text-white/90 uppercase tracking-wider">x</span>
                    <span className="text-2xl font-bold text-white">{quantity || '0'} Items</span>
                </div>
                <div className="flex space-x-4">
                    <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-semibold text-sm">{order?.buyer?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className="font-semibold text-sm">{shippingCode || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Order</p>
                        <p className="font-semibold text-sm">#{order.vendor_order_id || '1234'}</p>
                    </div>
                </div>

                {isErrorQueue && (
                    <div className="flex flex-col items-start w-full sm:w-auto mb-2 sm:mb-0">
                        <div className="text-xl text-red-500 font-bold">{currentErrorIndex + 1} of {totalErrorOrders}</div>
                    </div>
                )}
            </div>
        </header>
    );
}