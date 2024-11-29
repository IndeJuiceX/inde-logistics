import React from 'react';

export default function PickingAppModal({ isOpen, onClose, statusClass = 'noOrder', children }) {
    if (!isOpen) return null;

    const overlayClasses = {
        base: 'fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-200',
        noOrder: 'bg-opacity-30 backdrop-blur-sm',
        newOrder: 'bg-opacity-40 backdrop-blur-sm',
        error: 'bg-opacity-60 backdrop-blur-sm',
    };

    const modalClasses = {
        base: 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative transform transition-all duration-200 scale-100',
        noOrder: 'border-t-4 border-blue-500',
        newOrder: 'border-t-4 border-green-500',
        error: 'border-t-4 border-red-500',
    };

    return (
        <div 
            className={`${overlayClasses.base} ${overlayClasses[statusClass]}`}
            onClick={onClose}
        >
            <div 
                className={`${modalClasses.base} ${modalClasses[statusClass]}`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    onClick={onClose}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
}

