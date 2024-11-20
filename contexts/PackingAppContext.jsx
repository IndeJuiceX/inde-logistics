"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';

export const PackingAppContext = createContext();

export const PackingAppProvider = ({ children, orderData }) => {
    const [order, setOrder] = useState(orderData);

    const handleSignOut = async () => {
        await doLogOut();
    };

    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order }}>
            {children}
        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);