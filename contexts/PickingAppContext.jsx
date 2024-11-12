"use client";

import { createContext, useState, useContext, useEffect } from 'react';

export const PickingAppContext = createContext();

export const PickingAppProvider = ({ children }) => {
    const [isBarcodeInitiated, setBarcodeInitiated] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    useEffect(() => {
        const isBarcodeInitiated = localStorage.getItem("isBarcodeInitiated");
        if (isBarcodeInitiated && isBarcodeInitiated === "true") {
            console.log('isBarcodeInitiated', isBarcodeInitiated);
            setBarcodeInitiated(true);
        }
    }, []);

    useEffect(() => {

        let inactivityTimeout;

        const handleActivity = () => {
            setLastActivityTime(Date.now());
            if (inactivityTimeout) {
                clearTimeout(inactivityTimeout);
            }
            inactivityTimeout = setTimeout(checkInactivity, 10 * 60 * 1000); // 10 minutes
        };

        const checkInactivity = () => {
            console.log('User has been inactive for 10 minutes');
            localStorage.setItem("isBarcodeInitiated", "false");
            // Trigger your event here
        };

        window.addEventListener("keypress", handleActivity);
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("mousedown", handleActivity);
        window.addEventListener("touchstart", handleActivity);

        inactivityTimeout = setTimeout(checkInactivity, 10 * 60 * 1000); // 10 minutes

        return () => {
            window.removeEventListener("keypress", handleActivity);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("mousedown", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
            if (inactivityTimeout) {
                clearTimeout(inactivityTimeout);
            }
        };
    }, [lastActivityTime]);


    return (
        <PickingAppContext.Provider
            value={
                { isBarcodeInitiated, setBarcodeInitiated }
            }>
            {children}
        </PickingAppContext.Provider>
    );
};
export const usePickingAppContext = () => useContext(PickingAppContext);