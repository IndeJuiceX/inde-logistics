'use client';

import { createContext, useState, useContext } from 'react';

export const ErrorAppContext = createContext();

export const ErrorAppProvider = ({ children, errorData }) => {
    const [errorOrders, setErrorOrders] = useState(null);
    const [totalErrorOrders, setTotalErrorOrders] = useState(errorData?.length || 0);
    const [currentErrorOrderIndex, setCurrentErrorOrderIndex] = useState(0);
    const [currentErrorOrder, setCurrentErrorOrder] = useState(errorData[currentErrorOrderIndex]);
    
    return (
        <ErrorAppContext.Provider value={{ errorOrders, setErrorOrders, totalErrorOrders, setTotalErrorOrders, currentErrorOrder, setCurrentErrorOrder, currentErrorOrderIndex, setCurrentErrorOrderIndex }}>
            {children}
        </ErrorAppContext.Provider>
    );
};

export const useErrorAppContext = () => useContext(ErrorAppContext);