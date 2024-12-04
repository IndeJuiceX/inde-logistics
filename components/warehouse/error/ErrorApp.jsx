'use client';
import { useEffect } from 'react';
import ErrorHeading from '@/components/warehouse/error/ErrorHeading';
import { ErrorAppProvider } from '@/contexts/ErrorAppContext';
import ErrorItems from '@/components/warehouse/error/ErrorItems';
import RightPanel from '@/components/warehouse/error/RightPanel';
import { GlobalStateProvider } from '@/contexts/GlobalStateContext';
import ErrorModal from '@/components/warehouse/errorModal/ErrorModal';
import PageSpinner from '@/components/loader/PageSpinner';

export default function ErrorApp({ errorsData }) {
 

    useEffect(() => {
        console.log('errorsData', errorsData);
    }, [errorsData]);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <GlobalStateProvider>
                <ErrorModal />
                <PageSpinner />
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
                        <RightPanel />
                    </div>

                    {/* Footer */}
                    <footer className="bg-black text-white text-center py-2">
                        <span>Ali B.</span>
                    </footer>
                </ErrorAppProvider>
            </GlobalStateProvider>
        </div>
    );
}
