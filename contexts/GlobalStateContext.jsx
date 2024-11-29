"use client";

import { createContext, useState, useContext } from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    // States for the loading spinner
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // States for the error popup
    const [error, setError] = useState(false);
    const [errorRedirect, setErrorRedirect] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorReload, setIsErrorReload] = useState(true);


    // Globally assign the selected vender products
    const [globalProducts, setGlobalProducts] = useState([]);

   

    return (
        <GlobalStateContext.Provider
            value={
                { loading, loaded, setLoading, setLoaded, error, setError, errorMessage, setErrorMessage, errorRedirect, setErrorRedirect, globalProducts, setGlobalProducts, isErrorReload, setIsErrorReload }
            }>
            {children}
        </GlobalStateContext.Provider>
    );
};
export const useGlobalContext = () => useContext(GlobalStateContext);