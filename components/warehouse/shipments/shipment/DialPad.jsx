'use client';

export default function DialPad({ onNumberEntered }) {
    return (
        <div className="bg-gray-200 p-4 rounded-md mb-4">
            <div className="grid grid-cols-3 gap-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                        key={num}
                        className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded"
                        onClick={() => onNumberEntered(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={() => onNumberEntered('backspace')}
                >
                    {'<'}
                </button>
                <button
                    className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={() => onNumberEntered('0')}
                >
                    0
                </button>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => onNumberEntered('ok')}
                >
                    ✓
                </button>
            </div>
        </div>
    );
}