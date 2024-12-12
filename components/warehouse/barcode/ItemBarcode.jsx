import { useEffect, useState } from "react"
import { FaBarcode } from "react-icons/fa";
import { MdAddCircleOutline, MdUpdate } from 'react-icons/md';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { addBarcodeToProduct } from '@/services/data/product';

export default function ItemBarcode({ styles, onBarcodeScanned, currentItem, order }) {


    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    const [isNewBarcode, setIsNewBarcode] = useState(false);
    const [needsQuantityConfirmation, setNeedsQuantityConfirmation] = useState(false);
    const [confirmBarcode, setConfirmBarcode] = useState('');
    const [confirmBarcodeError, setConfirmBarcodeError] = useState(false);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                // console.log('barcodeValue 1', barcodeValue);
                if (isNewBarcode) {
                    setIsNewBarcode(false);
                    addNewBarcode();
                    return;
                }

                if (currentItem.barcodes && Array.isArray(currentItem.barcodes) && currentItem.barcodes.includes(barcodeValue)) {
                    setBarcodeError(false);
                    setBarcodeValue(barcodeValue);
                    if (currentItem.quantity > 1) {
                        if (confirmBarcode !== '' && confirmBarcode === barcodeValue) {
                            setNeedsQuantityConfirmation(false);
                            onBarcodeScanned(barcodeValue);
                        }
                        else {
                            setConfirmBarcode(barcodeValue);
                            setNeedsQuantityConfirmation(true);
                        }
                    } else {
                        onBarcodeScanned(barcodeValue);
                    }
                } else {
                    if (confirmBarcode !== '' && needsQuantityConfirmation) {
                        setConfirmBarcodeError(true);
                        setTimeout(() => {
                            setConfirmBarcodeError(false);
                        }, 2000);
                    }
                    setBarcodeError(true);
                }
                setBarcodeValue('');
            } else {
                setBarcodeValue((prev) => prev + event.key);
            }
        };

        window.addEventListener('keypress', handleKeyDown);

        return () => {
            window.removeEventListener('keypress', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barcodeValue, currentItem, isNewBarcode]);

    const handleAddNewBarcode = () => {
        setIsNewBarcode(true);
    }


    const addNewBarcode = async () => {
        if (!order.vendor_id || !currentItem.vendor_sku || !barcodeValue) {
            return;
        }

        const response = await addBarcodeToProduct(order.vendor_id, currentItem.vendor_sku, barcodeValue);
        if (response.success) {
            setBarcodeError(false);
            setBarcodeValue(barcodeValue);
            onBarcodeScanned(barcodeValue);
        }
        else {
            console.log('addNewBarcode error', response.error);
        }

    }
    return (
        <>
            <div className="flex items-center justify-between p-2 transition-all duration-200">
                <FaBarcode className="text-slate-500 text-xl transition-colors duration-200" />
                <div className="flex-1 mx-2">
                    {barcodeError ? (
                        <div className="flex justify-between items-center">
                            <button
                                disabled={isNewBarcode}
                                onClick={handleAddNewBarcode}
                                className="text-blue-600 px-2 py-1 text-sm flex items-center disabled:opacity-50 hover:text-blue-800 transition-colors duration-200"
                            >
                                <MdAddCircleOutline className="mr-1" /> New
                            </button>
                            <span className="text-red-500 text-xs text-center mx-2 transition-colors duration-200">
                                Barcode error.<br />Select option.
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 transition-colors duration-200">
                            Scan barcode...
                        </p>
                    )}
                </div>
            </div>
            <PickingAppModal isOpen={isNewBarcode} onClose={() => setIsNewBarcode(false)} statusClass="noOrder">
                <div className="p-4">
                    <p className="text-center text-slate-600 mb-4">
                        Please re-scan the barcode for confirmation
                    </p>
                    <div className="flex justify-center items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.3s]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.6s]"></span>
                    </div>
                </div>
            </PickingAppModal>
            <PickingAppModal
                isOpen={needsQuantityConfirmation}
                onClose={() => setNeedsQuantityConfirmation(false)}
                statusClass="error"
            >
                <div className="p-4">
                    <p className="text-center text-slate-600 mb-4">
                        {confirmBarcodeError ? 'Barcode error. Barcode not matching.' : `This item requires ${currentItem.quantity} units.
                        Please re-scan the barcode for confirmation`}
                    </p>
                    <div className="flex justify-center items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.3s]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.6s]"></span>
                    </div>
                </div>
            </PickingAppModal>
        </>
    )
}
