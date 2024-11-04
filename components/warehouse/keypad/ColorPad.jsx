

export default function ColorPad({ onValueSelected }) {
    return (
        <div className="bg-gray-200 p-4 rounded-lg h-[404px] overflow-y-auto relative top-[21%]">
            <div className="space-y-2">
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('G')}>Green</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('W')}>White</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('BK')}>Black</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('R')}>Red</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('B')}>Blue</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('GY')}>Grey</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('O')}>Orange</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('W2')}>White 2</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('R2')}>Red 2</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('B2')}>Blue 2</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('Y')}>Yellow</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('P')}>Pink</button>
                <button className="bg-white text-gray-700 font-semibold py-2 w-full rounded-md" onClick={() => onValueSelected('LI')}>Lilac</button>
            </div>
        </div>
    )
}