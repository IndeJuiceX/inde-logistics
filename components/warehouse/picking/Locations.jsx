import React from 'react';



const colorClasses = {
    G: 'bg-green-500 text-white',
    W: 'bg-gray-200 text-gray-700',
    BK: 'bg-black text-white',
    R: 'bg-red-500 text-white',
    B: 'bg-blue-500 text-white',
    GY: 'bg-gray-500 text-white',
    O: 'bg-orange-500 text-white',
    W2: 'bg-gray-300 text-gray-700',
    R2: 'bg-red-600 text-white',
    B2: 'bg-blue-600 text-white',
    Y: 'bg-yellow-400 text-gray-700',
    P: 'bg-pink-300 text-gray-700',
    LI: 'bg-purple-300 text-white',
};

export default function Locations({ location }) {
    const getColorClass = (key) => colorClasses[key] || 'bg-gray-100 text-gray-700';

    return (
        <div className="flex flex-col space-y-1">
            <div className="grid grid-cols-2 gap-1">
                <LocationItem label="Aisle" value={location?.aisle} />
                <LocationItem label="Number" value={location?.aisle_number} />
                <LocationItem
                    label="Shelf"
                    value={location?.shelf}
                    colorClass={getColorClass(location?.shelf || '')}
                />
                <LocationItem
                    label="Number"
                    value={location?.shelf_number}
                    colorClass={getColorClass(location?.shelf || '')}
                />
            </div>
        </div>
    );
}

function LocationItem({ label, value, colorClass }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${colorClass || 'bg-gray-100'}`}>
                {value || '-'}
            </span>
        </div>
    );
}
