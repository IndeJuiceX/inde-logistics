'use client';

import { useContext } from 'react';
import { PackingAppContext } from '@/contexts/PackingAppContext';

export default function PackingItems() {
    const { order } = useContext(PackingAppContext);
    // console.log(order);

    return (
        <main className="flex-1 overflow-y-auto p-2 bg-slate-50 h-full">
            {order.items.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-md mb-2 p-4 flex items-center relative h-48"
                >
                    {/* Image column */}
                    <div className="w-1/4 relative h-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={item.image || 'https://cdn.indejuice.com/images/4j6.jpg'}
                                alt={item.name}
                                className="w-full h-full rounded-md object-contain"
                            />
                        </div>
                    </div>

                    {/* Quantity column */}
                    <div className="w-1/5 flex items-center justify-center px-2">
                        <div className={`
                            aspect-square w-24 
                            ${item.quantity > 1 ? 'bg-red-500' : 'bg-blue-500'} 
                            rounded-xl shadow-md
                            flex flex-col items-center justify-center
                            transition-colors duration-200
                        `}>
                            <span className="text-4xl font-bold text-white">
                                {item.quantity}
                            </span>
                            <span className="text-sm text-white/90 uppercase tracking-wider">
                                units
                            </span>
                        </div>
                    </div>

                    {/* Product details column */}
                    <div className="w-2/5 px-2 flex flex-col justify-center space-y-2">
                        {/* Product Name */}
                        <h3 className="font-bold text-base text-slate-800">
                            {item.name}
                        </h3>

                        {/* Brand */}
                        <div className="flex items-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Brand:</span>
                            <span className="ml-2 text-sm font-medium text-slate-700">
                                {item.brand_name}
                            </span>
                        </div>

                        {/* Attributes */}
                        <div className="flex flex-wrap gap-1">
                            {Object.values(item.attributes || {})
                                .filter(value => value && value.length > 0)
                                .map((value, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full 
                                                 text-xs font-medium bg-slate-100 text-slate-700"
                                    >
                                        {Array.isArray(value) ? value.join(', ') : value}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
            ))}
        </main>
    );
}
