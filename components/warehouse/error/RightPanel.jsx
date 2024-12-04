import PackingOptions from '@/components/warehouse/error/PackingOptions';
import PackageSize from '@/components/warehouse/error/PackageSize';
import NextPreviousButton from '@/components/warehouse/error/NextPreviousButton';
import { useErrorAppContext } from '@/contexts/ErrorAppContext';

export default function RightPanel() {
    const { currentErrorOrder, currentOrderShipment, selectedParcelOption } = useErrorAppContext();
    return (
        <div className="w-1/3 bg-green-100 p-4 space-y-4">
            {/* Length/Width/Height/Weight */}
            <PackingOptions />
            {selectedParcelOption !== '' && (
                <PackageSize />
            )}


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
    );
}