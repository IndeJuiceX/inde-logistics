'use client';
import { useRef, useEffect, useState } from 'react';
import JsBarcode from 'jsbarcode';
import styles from '@/styles/warehouse/picking-app/InitiateBarcodeScanner.module.scss';

export default function InitiateBarcodeScanner({ value }) {
    const svgRef = useRef(null);
    const [showPopup, setShowPopup] = useState(true);
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
        {/* eslint-disable-next-line react-hooks/exhaustive-deps */ }
    }, []);
    const closePopup = () => {
        setShowPopup(false);
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Assuming the barcode scanner inputs as keyboard events
            if (event.key === 'Enter') {
                if (barcodeValue === barcodeSetUp) {
                    setShowPopup(false);
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
    }, [value, barcodeValue, barcodeSetUp]);
    // return <svg ref={svgRef}></svg>;
    return (
        <>
            {showPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupContent}>
                        <button className={styles.closeButton} onClick={closePopup}>
                            &times;
                        </button>
                        {/* Centered Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <svg className={styles.popupImage} ref={svgRef}></svg>;
                        {/* <img
                    src="/path/to/image.png"
                    alt="Popup Image"
                    className={styles.popupImage}
                /> */}
                    </div>
                </div>
            )}
        </>
    )
};

