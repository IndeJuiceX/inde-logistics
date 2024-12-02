export default function ErrorApp() {
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center bg-white px-6 py-4 shadow">
                <div className="text-xl font-bold">x2 ITEMS</div>
                <div className="flex items-center space-x-8">
                    <span className="font-medium">INVITEXGG</span>
                    <span className="text-gray-500">C J Keenan</span>
                    <span className="text-sm text-gray-500">24H DELIVERY</span>
                    <span className="text-sm font-semibold text-red-600">2 of 3 IN QUEUE</span>
                    <div className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">≡</div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Panel */}
                <div className="w-2/3 p-4">
                    <div className="bg-red-200 text-red-800 font-semibold p-2 rounded mb-4">PROBLEM: Missing Item</div>
                    <div className="bg-white shadow p-4 rounded flex items-center">
                        {/* eslint-disable-next-line */}
                        <img
                            src="https://via.placeholder.com/50"
                            alt="Product"
                            className="w-16 h-16 rounded border"
                        />
                        <div className="ml-4 flex flex-col">
                            <span className="font-bold text-lg">Summer Blaze</span>
                            <span className="text-sm text-gray-500">Nicotine Salt by IVG</span>
                            <span className="text-xs text-gray-400">10ml | 20mg | 50VG/50PG</span>
                        </div>
                        <div className="ml-auto bg-green-200 text-green-700 font-bold text-xl px-4 py-2 rounded-full">
                            x2
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-1/3 bg-green-100 p-4 space-y-4">
                    {/* Length/Width/Height/Weight */}
                    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                        <input
                            type="text"
                            value="29.1cm"
                            className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        <span className="font-semibold text-gray-600 text-sm">LENGTH</span>
                    </div>
                    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                        <input
                            type="text"
                            value="19.5cm"
                            className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        <span className="font-semibold text-gray-600 text-sm">WIDTH</span>
                    </div>
                    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                        <input
                            type="text"
                            value="2.4cm"
                            className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        <span className="font-semibold text-gray-600 text-sm">HEIGHT</span>
                    </div>
                    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                        <input
                            type="text"
                            value="174.5g"
                            className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        <span className="font-semibold text-gray-600 text-sm">WEIGHT</span>
                    </div>

                    {/* Label and Tick Section */}
                    <div className="flex space-x-4">
                        <div className="flex items-center bg-white p-4 rounded shadow justify-center w-1/2">
                            {/* eslint-disable-next-line */}
                            <img src="https://dev.indejuice.com/img/wh/print.png" alt="Label Icon" className="ml-2 h-8" />
                            LABEL
                        </div>
                        {/* Tick Button */}
                        <div className="flex items-center bg-white p-4 rounded shadow justify-center w-1/2">
                            {/* eslint-disable-next-line */}
                            <img src="https://dev.indejuice.com/img/wh/tick_green_large.png" alt="Tick Icon" className="ml-2 h-9" />
                        </div>
                    </div>

                    {/* New Section: Warning and Navigation */}

                    <div className="fixed bottom-10 right-0 w-1/3 p-4 bg-green-100 flex space-x-4" style={{ backgroundColor: '#FFCECE' }}>
                        {/* Warning Icon Section */}
                        <div className="flex items-center justify-center bg-white p-4 rounded shadow w-1/2">
                            {/* eslint-disable-next-line */}
                            <img
                                src="https://dev.indejuice.com/img/wh/warning.png"
                                alt="Warning Icon"
                                className="h-12 w-12"
                            />
                        </div>

                        {/* Next/Previous Buttons */}
                        <div className="flex items-center justify-between w-1/2">
                            <button className="bg-white p-4 rounded shadow hover:bg-gray-300">
                                {/* eslint-disable-next-line */}
                                <img src="https://dev.indejuice.com/img/pager/arrow_prev_red.png" alt="Previous" className="h-6 w-6" />
                            </button>
                            <button className="bg-white p-4 rounded shadow hover:bg-gray-300">
                                {/* eslint-disable-next-line */}
                                <img src="https://dev.indejuice.com/img/pager/arrow_next_red.png" alt="Next" className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black text-white text-center py-2">
                <span>Ali B.</span>
            </footer>
        </div>
    );
}
