import React, { useEffect } from 'react';

const colors = [
    { code: 'G', name: 'Green', bg: 'bg-green-500' },
    { code: 'W', name: 'White', bg: 'bg-white' },
    { code: 'BK', name: 'Black', bg: 'bg-black' },
    { code: 'R', name: 'Red', bg: 'bg-red-500' },
    { code: 'B', name: 'Blue', bg: 'bg-blue-500' },
    { code: 'GY', name: 'Grey', bg: 'bg-gray-500' },
    { code: 'O', name: 'Orange', bg: 'bg-orange-500' },
    // { code: 'W2', name: 'White 2', bg: 'bg-white' },
    // { code: 'R2', name: 'Red 2', bg: 'bg-red-600' },
    // { code: 'B2', name: 'Blue 2', bg: 'bg-blue-600' },
    { code: 'Y', name: 'Yellow', bg: 'bg-yellow-500' },
    { code: 'P', name: 'Pink', bg: 'bg-pink-500' },
    { code: 'LI', name: 'Lilac', bg: 'bg-purple-300' },
];

export default function ColorPad({ onValueSelected }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const color = colors.find(c => c.code.toLowerCase() === e.key.toLowerCase());
            if (color) {
                onValueSelected(color.code);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onValueSelected]);

    const handleClear = () => {
        onValueSelected('');
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg">
            <div
                className="grid grid-cols-2 gap-2 mb-2"
                role="grid"
                aria-label="Color Pad"
            >
                {colors.map((color) => (
                    <button
                        key={color.code}
                        onClick={() => onValueSelected(color.code)}
                        className={`flex flex-col items-center justify-center h-16 rounded-md shadow-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-opacity ${color.bg} ${color.name === 'White' || color.name === 'White 2' ? 'border border-gray-300' : ''}`}
                        role="gridcell"
                        aria-label={color.name}
                    >
                        <span className={`font-semibold ${['White', 'White 2', 'Yellow'].includes(color.name) ? 'text-gray-800' : 'text-white'}`}>
                            {color.code}
                        </span>
                        <span className={`text-xs ${['White', 'White 2', 'Yellow'].includes(color.name) ? 'text-gray-600' : 'text-white'}`}>
                            {color.name}
                        </span>
                    </button>
                ))}
            </div>
            <button
                onClick={handleClear}
                className="w-full bg-red-500 text-white font-semibold py-3 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            >
                Clear
            </button>
        </div>
    );
}

