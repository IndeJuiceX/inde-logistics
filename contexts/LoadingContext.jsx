"use client";

import { createContext, useState } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading, loaded, setLoaded }}>
            {children}
        </LoadingContext.Provider>
    );
};