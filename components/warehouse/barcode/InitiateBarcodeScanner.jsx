'use client';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JsBarcode from 'jsbarcode';
import styles from '@/styles/warehouse/picking-app/InitiateBarcodeScanner.module.scss';
import { usePickingAppContext } from '@/contexts/PickingAppContext';

export default function InitiateBarcodeScanner() {
    const { isBarcodeInitiated, setBarcodeInitiated } = usePickingAppContext();
    const router = useRouter();
    const svgRef = useRef(null);
    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeSetUp, setBarcodeSetUp] = useState('');

    useEffect(() => {
        if (svgRef.current) {
            const newBarcode = Math.floor(Math.random() * 1000000000).toString();
            setBarcodeSetUp(newBarcode);
            JsBarcode(svgRef.current, newBarcode, {
                format: 'CODE128',
                lineColor: '#000',
                width: 2,
                height: 100,
                displayValue: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBarcodeInitiated]); // Regenerate barcode when initiation resets

    const closePopup = () => {
        router.push('/warehouse');
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Assuming the barcode scanner inputs as keyboard events
            if (event.key === 'Enter') {
                if (barcodeValue === barcodeSetUp) {
                    setBarcodeInitiated(true);
                    localStorage.setItem("isBarcodeInitiated", "true");
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
    }, [barcodeValue, barcodeSetUp, setBarcodeInitiated]);

    if (isBarcodeInitiated) {
        return null; // Don't render anything if initiated
    }

    // Show the initiation popup
    return (
        <>
            {!isBarcodeInitiated && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <button className={styles.closeButton} onClick={closePopup}>
                            &times;
                        </button>
                        <svg className={styles.popupImage} ref={svgRef}></svg>
                    </div>
                </div>
            )}
        </>
    );
}