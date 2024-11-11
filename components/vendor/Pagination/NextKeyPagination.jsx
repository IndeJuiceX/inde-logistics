'use client';
import React from "react";

export default function NextKeyPagination({ currentPage, totalPages, onPageChange, onNext, isLoading }) {
    return (
        <div className="flex space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index + 1}
                    onClick={() => onPageChange(index + 1)}
                    className={`${index + 1 === currentPage ? 'bg-blue-600' : 'bg-blue-500'
                        } hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                    disabled={isLoading}
                >
                    {index + 1}
                </button>
            ))}
            <button
                onClick={onNext}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isLoading}
            >
                Next
            </button>
        </div>
    );
}
