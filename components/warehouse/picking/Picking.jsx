'use client';

export default function Picking({ order }) {
    return (
        <div className="bg-black text-white h-screen w-screen flex flex-col items-center justify-center">
            {/* Main Container */}
            <div className="bg-gray-900 h-full w-full flex flex-col justify-between">
                {/* Header Section */}
                <div className="grid grid-cols-5 items-center gap-4 py-4 border-b border-gray-700">
                    <div className="text-center font-bold text-2xl bg-gray-800 rounded-lg py-2 px-4">
                        {order.orderCode || 'X1'}
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Customer</p>
                        <p className="font-bold text-white">{order.customerName || 'G M'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Referral</p>
                        <p className="font-bold text-white">{order.referralCode || 'INVITERI'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Delivery</p>
                        <p className="font-bold text-white">{order.deliveryTime || '48H'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Order</p>
                        <p className="font-bold text-white">{order.orderNumber || '#AOYL'}</p>
                    </div>
                </div>

                {/* Product & Location Section */}
                <div className="flex items-center justify-between px-4 py-4">
                    {/* Product Image */}
                    <div className="flex items-center bg-gray-800 p-2 rounded-lg">
                        {/* eslint-disable-next-line */}
                        <img
                            src={order.productImage || 'https://cdn.indejuice.com/images/4j6.jpg'}
                            alt="Product"
                            className="w-[20rem] h-[11rem] rounded-lg"
                        />
                        <div className="ml-4 bg-gray-700 rounded-full px-4 py-2 text-center text-white font-bold">
                            x{order.productQuantity || 1}
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="flex items-center space-x-2">
                        <div className="w-[8rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                            A
                        </div>
                        
                        <div className="w-[5rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                            2
                        </div>
                        <div className="w-[8rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                            4
                        </div>
                        <div className="w-[5rem] h-10 flex items-center justify-center bg-gray-700 rounded-lg text-white text-lg font-bold">
                            A
                        </div>
                    </div>
                </div>

                {/* Picker Info & Barcode */}
                <div className="flex justify-between items-center px-4 py-4 bg-gray-800">
                    <div className="text-center">
                        <p className="text-white font-bold">{order.pickerName || 'Ali B.'}</p>
                        <p className="text-sm text-gray-400">Container {order.container || '1'}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        {/* eslint-disable-next-line */}
                        <img
                            src={order.barcodeImage || '/placeholder-barcode.png'}
                            alt="Barcode"
                            className="w-32 h-auto mb-2"
                        />
                        <p className="text-gray-400">{order.barcodeText || '1234567890'}</p>
                    </div>
                </div>

                {/* Warning Button */}
                <div className="flex justify-end px-4 pb-4">
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full">
                        !
                    </button>
                </div>
            </div>
        </div>
    );
}
