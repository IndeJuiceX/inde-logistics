import { useEffect, useState } from "react"
import { FaBarcode } from "react-icons/fa";
import { MdAddCircleOutline, MdUpdate } from 'react-icons/md';
import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';

export default function ItemBarcode({ styles, onBarcodeScanned, currentItem }) {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    const [isNewBarcode, setIsNewBarcode] = useState(false);
    const [isNewBarcodeValue, setIsNewBarcodeValue] = useState('');

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                console.log('barcodeValue 1', barcodeValue);
                if (isNewBarcode) {
                    setIsNewBarcodeValue(barcodeValue);
                    setIsNewBarcode(false);
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
    // const addNewBarcode = async () => {
    //     console.log('addNewBarcode');
    //     const response 
    // }






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