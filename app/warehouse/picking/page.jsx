export default function PickingPage() {
    return (
        <div className="bg-gray-100 p-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
                {/* Header Section */}
                <div className="grid grid-cols-5 gap-5 mb-4">
                    <div className="flex justify-center items-center">
                        <p className="text-gray-800 font-bold">X-1367</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-bold">Customer:</p>
                        <p className="text-gray-800 font-bold">Sandra Lawrie</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-bold">Referral:</p>
                        <p className="text-gray-800 font-bold">INVITEX7EM</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-bold">Delivery:</p>
                        <p className="text-gray-800 font-bold">48H</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-bold">Order #:</p>
                        <p className="text-gray-800 font-bold">#0Y36</p>
                    </div>
                </div>

                {/* Image and Quantity Section */}
                <div className="flex justify-between mb-4">
                    <div>
                        {/* eslint-disable-next-line */}
                        <img src="https://cdn.indejuice.com/images/06r.jpg" alt="Mad Eyes Product" className="w-24 h-24 mb-2" />
                        <p className="text-gray-600">This product contains nicotine which is a highly addictive substance.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-200 p-2 rounded-lg mb-2">
                            <p className="text-gray-600">E</p>
                            <p className="text-gray-800 font-bold">6</p>
                        </div>
                        <div className="bg-gray-200 p-2 rounded-lg">
                            <p className="text-gray-600">G</p>
                            <p className="text-gray-800 font-bold">10</p>
                        </div>
                    </div>
                </div>

                {/* Ali B and Barcode Section */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-600 font-bold">Ali B.</p>
                        <p className="text-gray-600">1 Container</p>
                    </div>
                    <div className="flex flex-col items-center">

                        {/* eslint-disable-next-line */}
                        <img src="barcode.png" alt="Barcode" className="w-32 h-auto mb-2" />
                        <p className="text-gray-600">X-6836</p>
                    </div>
                </div>

                {/* Warning Button */}
                <div className="flex justify-end">
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        {'!'}
                    </button>
                </div>
            </div>
        </div>
    )
}
