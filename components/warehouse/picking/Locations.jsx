

export default function Locations({ location }) {
    console.log('location', location);
    
    const colors = {
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

    return (

        // <div>
            <div className="flex items-center space-x-2 border-4 border-gray-200">
                <div className="w-[8rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                    {location.aisle}
                </div>

                <div className="w-[5rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                    {location.aisle_number}
                </div>
                <div className={`w-[8rem] h-10 flex items-center justify-center rounded-lg text-lg font-bold ${colors[location.shelf]}`}>
                    {location.shelf}
                </div>
                <div className={`w-[5rem] h-10 flex items-center justify-center rounded-lg text-lg font-bold ${colors[location.shelf]}`}>
                    {location.shelf_number}
                </div>
            </div>
            
        // </div>
    )
}