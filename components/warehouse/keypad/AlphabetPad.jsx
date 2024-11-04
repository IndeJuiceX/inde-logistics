

export default function AlphabetPad({ onValueSelected }) {
    return (
        <div className="bg-gray-200 p-4 rounded-lg h-[404px] overflow-y-auto relative top-[21%]">
            <div className="space-y-2">
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('A')}>A</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('B')}>B</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('C')}>C</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('D')}>D</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('E')}>E</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('F')}>F</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('G')}>G</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('H')}>H</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('L')}>L</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('M')}>M</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('Z')}>Z</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('★')}>★</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('Ψ')}>Ψ</button>
            </div>
        </div>
    )
}