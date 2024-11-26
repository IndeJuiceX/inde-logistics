'use client';

export default function DialPad({ onNumberEntered }) {
    return (
        <div className="bg-gray-100 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                        key={num}
                        className="bg-white text-gray-800 font-bold py-6 rounded-lg hover:bg-gray-200"
                        onClick={() => onNumberEntered(num)}
                    >
                        {num}
                    </button>
                ))}
                <button
                    className="bg-white text-gray-800 font-bold py-6 rounded-lg hover:bg-gray-200"
                    onClick={() => onNumberEntered('backspace')}
                >
                    ←
                </button>
                <button
                    className="bg-white text-gray-800 font-bold py-6 rounded-lg hover:bg-gray-200"
                    onClick={() => onNumberEntered('0')}
                >
                    0
                </button>
                <button
                    className="bg-green-500 text-white font-bold py-6 rounded-lg hover:bg-green-600"
                    onClick={() => onNumberEntered('ok')}
                >
                    ✓
                </button>
            </div>
        </div>
    );
}