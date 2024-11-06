


export default function ActionButtons({ item }) {

    


    return (
        <>
            {(item?.warehouse?.shelved === undefined || item?.warehouse?.shelved === 0) && (
                <div className="flex items-center justify-center w-20 h-10 border-4 border-green-500 rounded">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" strokeWidth="1.5" fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"></path>
                    </svg>
                </div>
            )}

            {item?.warehouse?.shelved && item?.warehouse?.shelved === 1 && (
                <div className="flex items-center justify-center w-20 h-10 bg-gray-200 rounded">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" strokeWidth="1.5" fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"></path>
                    </svg>
                </div >
            )}
        </>
    )
}