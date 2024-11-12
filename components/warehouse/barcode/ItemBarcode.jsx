import { useEffect, useState } from "react"
import { FaBarcode } from "react-icons/fa";
import { MdAddCircleOutline, MdError, MdUpdate } from 'react-icons/md';





export default function ItemBarcode({ styles, onBarcodeScanned, currentItem }) {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    // console.log('currentItem', currentItem);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Assuming the barcode scanner inputs as keyboard events
            if (event.key === 'Enter') {
                if (barcodeValue === currentItem.barcode) {
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
    }, [barcodeValue, currentItem]);

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {barcodeError &&
                <>
                    <div className={styles.barcodeError}>
                            <button><MdAddCircleOutline /> New</button>
                            <span style={{
                                textAlign: 'center',
                            }}>Barcode error.<br />Select option.</span>
                            <button><MdUpdate /> Override</button>
                    </div>
                </>
            }
            {
                !barcodeError &&
                <FaBarcode className={styles.barcodeImage} />
            }

        </>
    )
}