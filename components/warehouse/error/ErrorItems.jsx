'use client';

import { useErrorAppContext } from '@/contexts/ErrorAppContext';


export default function ErrorItems() {
    const { currentErrorOrder } = useErrorAppContext();
    return (
        <>
            {(currentErrorOrder && currentErrorOrder?.items.length > 0) && currentErrorOrder?.items?.map((item, index) => (

                <div className="bg-white shadow p-4 rounded flex items-center mb-4" key={index}>
                    {/* eslint-disable-next-line */}
                    <img
                        src={item.image}
                        alt="Product"
                        className="w-16 h-16 rounded border"
                    />
                    <div className="ml-4 flex flex-col">
                        <span className="font-bold text-lg">{item.name}</span>
                        <span className="text-sm text-gray-500">{item.brand}</span>
                        <span className="text-xs text-gray-400">
                        {Object.values(item.attributes || {})
                                    .filter(value => value && value.length > 0)
                                    .map(value => Array.isArray(value) ? value.join(', ') : value)
                                    .join(' | ')}</span>
                    </div>
                    <div className="ml-auto bg-green-200 text-green-700 font-bold text-xl px-4 py-2 rounded-full">
                        x{item.quantity}
                    </div>
                </div>

            ))}
        </>
    );
}