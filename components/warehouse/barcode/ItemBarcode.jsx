import { useEffect, useState } from "react"




export default function ItemBarcode({ styles, onBarcodeScanned, currentItem }) {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeError, setBarcodeError] = useState(false);
    console.log('currentItem', currentItem);

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
        <div className={styles.barcodeInfo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {barcodeError &&
                <img className={styles.barcodeImage} src="https://dev.indejuice.com/img/wh/barcode_scan.png" alt="Barcode Error" />
            }
            {!barcodeError &&
                <img className={styles.barcodeImage} src="https://dev.indejuice.com/img/wh/barcode.png" alt="Barcode" />
            }

        </div>
    )
}