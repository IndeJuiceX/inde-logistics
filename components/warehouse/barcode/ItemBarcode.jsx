import { useEffect, useState } from "react"
import { FaBarcode } from "react-icons/fa";
import { MdAddCircleOutline, MdUpdate } from 'react-icons/md';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';

export default function ItemBarcode({ styles, onBarcodeScanned, currentItem, order }) {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    const [isNewBarcode, setIsNewBarcode] = useState(false);

    console.log('currentItem', currentItem);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                console.log('barcodeValue 1', barcodeValue);
                if (isNewBarcode) {

                    setIsNewBarcode(false);
                    addNewBarcode();
                    return;
                }

                if (currentItem.barcode && barcodeValue === currentItem.barcode) {
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
    }, [barcodeValue, currentItem, isNewBarcode]);

    const handleAddNewBarcode = () => {
        console.log('handleAddNewBarcode');

        setIsNewBarcode(true);
    }

    // create the callback function for the button onClick event
    // vendor_id, vendor_sku, barcode
    const addNewBarcode = async () => {
        console.log('addNewBarcode');
        const payload = {
            vendor_id: order.vendor_id,
            vendor_sku: currentItem.vendor_sku,
            barcode: barcodeValue
        }
        const response = await fetch('/api/v1/admin/products/add-barcode', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            console.log('data', data);
            if (data.success) {
                setBarcodeError(false);
                setBarcodeValue(barcodeValue);
                onBarcodeScanned(barcodeValue);
            }
            else {
                console.log('error', data.error);
            }
        }
        else {
            console.log('error', response.statusText);

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
            <PickingAppModal isOpen={isNewBarcode} onClose={() => setIsNewBarcode(false)}>
                <div>
                    <p>Please re-scan the barcode for confirmation</p>
                </div>
            </PickingAppModal>
        </>
    )
}