import { useEffect, useState } from "react"
import { FaBarcode } from "react-icons/fa";
import { MdAddCircleOutline, MdUpdate } from 'react-icons/md';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';
import { addBarcodeToProduct } from '@/services/data/product';

export default function ItemBarcode({ styles, onBarcodeScanned, currentItem, order }) {


    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    const [isNewBarcode, setIsNewBarcode] = useState(false);

    // console.log('currentItem', currentItem);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                console.log('barcodeValue 1', barcodeValue);
                if (isNewBarcode) {
                    setIsNewBarcode(false);
                    addNewBarcode();
                    return;
                }

                if (currentItem.barcodes && Array.isArray(currentItem.barcodes) && currentItem.barcodes.includes(barcodeValue)) {
                    setBarcodeError(false);
                    setBarcodeValue(barcodeValue);
                    onBarcodeScanned(barcodeValue);
                } else {
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
        console.log('handleAddNewBarcode');

        setIsNewBarcode(true);
    }

    // create the callback function for the button onClick event
    // vendor_id, vendor_sku, barcode
    const addNewBarcode = async () => {
        // const payload = {
        //     vendor_id: order.vendor_id,
        //     vendor_sku: currentItem.vendor_sku,
        //     barcode: barcodeValue
        // }

        if (!order.vendor_id || !currentItem.vendor_sku || !barcodeValue) {
            console.log('addNewBarcode error', order.vendor_id, currentItem.vendor_sku, barcodeValue);
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
            {barcodeError &&
                <>
                    <div className={styles.barcodeError}>
                        <button disabled={isNewBarcode} onClick={handleAddNewBarcode}><MdAddCircleOutline /> New</button>
                        <span style={{ textAlign: 'center' }}>Barcode error.<br />Select option.</span>
                        <button><MdUpdate /> Override</button>
                    </div>
                </>
            }
            {
                !barcodeError &&
                <FaBarcode className={styles.barcodeImage} />
            }
            <PickingAppModal isOpen={isNewBarcode} onClose={() => setIsNewBarcode(false)} styles={'noOrder'}>
                <div>
                    <p>Please re-scan the barcode for confirmation</p>
                </div>
            </PickingAppModal>
        </>
    )
}