// components/Modal.js
import { useEffect, useState } from 'react';


export default function Modal({ isOpen, onClose, title, children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // To ensure `document` is defined
        setMounted(true);

        function handleEsc(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-lg w-full h-[85%] max-w-md mx-auto p-4 z-10">
                {/* <div className="mt-4"> */}
                    {children}
                    {/* </div> */}
            </div>
        </div>
    );
}