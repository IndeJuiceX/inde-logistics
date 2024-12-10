'use client';

import { useState } from 'react';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import Link from 'next/link';

export default function PackingHeader() {
    const { order, isErrorQueue, currentErrorIndex, totalErrorOrders, handleSignOut } = usePackingAppContext();
    const couriers = order?.shipment?.courier;
    const shipmentCode = couriers[0]?.shipping_code;
    const shippingCode = shipmentCode?.split('-')[1];
    const quantity = order?.items?.reduce((acc, item) => acc + item.quantity, 0);
    const [isOpenModal, setIsOpenModal] = useState(false);

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
                <div className="flex items-center w-full sm:w-auto" onClick={() => setIsOpenModal(true)}>
                    <div className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">≡</div>
                </div>

                <PickingAppModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} >
                    <div className="flex flex-col items-center space-y-4">
                        <h1 className="text-white text-lg">Menu</h1>
                        {isErrorQueue && (
                            <Link href={'/warehouse/packing'} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" >
                                Resume Packing
                            </Link>
                        )}
                        {!isErrorQueue && (
                            <Link href={'/warehouse/error'} className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" >
                                Errors Queue
                            </Link>
                        )}
                        <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md">
                            Manifest Orders
                        </button>
                        <button className="border border-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md" onClick={handleSignOut}>
                            Logout
                        </button>
                    </div>

                </PickingAppModal>
            </div>
        </header>
    );
}