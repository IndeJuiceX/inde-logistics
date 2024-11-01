

export default function DialPad() {
    return (
        <div className="bg-gray-200 p-4 rounded-md mb-4">
            <div className="grid grid-cols-3 gap-4">
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">1</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">2</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">3</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">4</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">5</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">6</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">7</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">8</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">9</button>
            </div>
            <div className="flex justify-between mt-4">
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">{'<'}</button>
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">0</button>
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">✓</button>
            </div>
        </div>
    );
}