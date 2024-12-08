'use client'
import React, { useEffect } from 'react';
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import { useRouter } from 'next/navigation';

export default function ErrorModal() {
    const router = useRouter();
    const { setError, error, errorRedirect, errorMessage, isErrorReload } = useGlobalContext();

    const handleRedirect = () => {
        setError(false);
        if (isErrorReload) {
            if (errorRedirect) {

                // window.location = errorRedirect;
                router.push(errorRedirect);
            } else {
                // window.location.reload();
                router.reload();
                setError(false);
            }
        }
    };

    useEffect(() => {
        if (error) {
            const body = document.body;
            body.style.overflow = 'hidden';

            return () => {
                body.style.overflow = '';
            };
        }
    }, [error]);

    if (!error) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 h-screen bg-black bg-opacity-40 z-[3001] backdrop-blur-sm">
                <div className="relative top-1/2 mx-auto w-[300px] bg-gray-200 rounded-lg shadow-lg p-4 -translate-y-1/2 transition duration-500">
                    <div className="text-center absolute top-0 left-0 right-0 bg-gray-300 rounded-t-lg text-lg font-medium text-black py-3 shadow-inner border-t border-b border-gray-200">
                        Error
                    </div>
                    <div className="text-sm text-black text-opacity-80 p-16 text-center">
                        {errorMessage}
                    </div>
                    <button
                        className="absolute bottom-5 left-5 right-5 w-auto text-center text-sm font-light text-white bg-gradient-to-b from-black via-black/60 to-black rounded-md py-2 border-b-2 border-black/20 hover:bg-opacity-80 transition duration-700"
                        onClick={handleRedirect}
                    >
                        OK
                    </button>
                </div>
            </div>
        </>
    );
}