'use client';
import { useEffect } from 'react';
import ErrorHeading from '@/components/warehouse/error/ErrorHeading';
import { ErrorAppProvider } from '@/contexts/ErrorAppContext';
import NextPreviousButton from '@/components/warehouse/error/NextPreviousButton';
import ErrorItems from '@/components/warehouse/error/ErrorItems';

export default function ErrorApp({ errorsData }) {

    useEffect(() => {
        console.log('errorsData', errorsData);
    }, [errorsData]);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <ErrorAppProvider errorData={errorsData.data}>
                {/* Header */}
                <ErrorHeading />

                {/* Main Content */}
                <div className="flex flex-1">
                    {/* Left Panel */}
                    <div className="w-2/3 p-4">
                        <div className="bg-red-200 text-red-800 font-semibold p-2 rounded mb-4">PROBLEM: Missing Item</div>
                        <ErrorItems />
                    </div>

                    {/* Right Panel */}
                    <div className="w-1/3 bg-green-100 p-4 space-y-4">
                        {/* Length/Width/Height/Weight */}
                        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                            <div
                                type="text"
                                value="29.1cm"
                                className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                29.1cm
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">LENGTH</span>
                        </div>
                        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                            <div
                                type="text"
                                value="19.5cm"
                                className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                19.5cm
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">WIDTH</span>
                        </div>
                        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                            <div
                                type="text"
                                value="2.4cm"
                                className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                2.4cm
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">HEIGHT</span>
                        </div>
                        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                            <div
                                type="text"
                                value="174.5g"
                                className="bg-gray-100 text-sm text-gray-700 w-24 p-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                174.5g
                            </div>
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
                            <NextPreviousButton />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-black text-white text-center py-2">
                    <span>Ali B.</span>
                </footer>
            </ErrorAppProvider>
        </div>
    );
}
