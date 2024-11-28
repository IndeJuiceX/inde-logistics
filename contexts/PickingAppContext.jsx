"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions'; // Client-side sign-out

export const PickingAppContext = createContext();

export const PickingAppProvider = ({ children }) => {
    const [isBarcodeInitiated, setBarcodeInitiated] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    useEffect(() => {
        const isBarcodeInitiated = localStorage.getItem("isBarcodeInitiated");
        if (isBarcodeInitiated && isBarcodeInitiated === "true") {
            
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

    const handleSignOut = async () => {
        await doLogOut(); // Redirect to login after sign-out
    };
    return (
        <PickingAppContext.Provider
            value={
                { isBarcodeInitiated, setBarcodeInitiated, handleSignOut }
            }>
            {children}
        </PickingAppContext.Provider>
    );
};
export const usePickingAppContext = () => useContext(PickingAppContext);