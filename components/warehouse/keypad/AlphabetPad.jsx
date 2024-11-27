import React, { useEffect, useRef } from 'react';

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'Z', '★', 'Ψ'];

export default function AlphabetPad({ onValueSelected }) {
    const gridRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (letters.includes(key)) {
                onValueSelected(key);
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
                ref={gridRef}
                className="grid grid-cols-3 gap-2 mb-2"
                role="grid"
                aria-label="Alphabet Pad"
            >
                {letters.map((letter) => (
                    <button
                        key={letter}
                        onClick={() => onValueSelected(letter)}
                        className="bg-white text-gray-700 font-semibold py-3 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                        role="gridcell"
                    >
                        {letter}
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

