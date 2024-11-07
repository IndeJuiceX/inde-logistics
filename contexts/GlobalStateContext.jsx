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


    // Globally assign the selected vender products
    const [globalProducts, setGlobalProducts] = useState([]);

    // // Functions to control loading state
    // const showLoading = () => setLoading(true);
    // const hideLoading = () => setLoading(false);

    // // Functions to control error state
    // const showError = (message) => setError(message);
    // const hideError = () => setError(null);
    // error,
    // showError,
    // hideError,

    return (
        <GlobalStateContext.Provider
            value={
                { loading, loaded, setLoading, setLoaded, error, setError, errorMessage, setErrorMessage, errorRedirect, setErrorRedirect, globalProducts, setGlobalProducts }
            }>
            {children}
        </GlobalStateContext.Provider>
    );
};
export const useGlobalContext = () => useContext(GlobalStateContext);