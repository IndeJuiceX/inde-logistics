"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { getLoggedInUser } from '@/app/actions';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {

    const [user, setUser] = useState(null);


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

    useEffect(() => {
        if (user) {
            return;
        }
        const getUser = async () => {
            const user = await getLoggedInUser();
            setUser(user);
        }
        if (!user) {
            getUser();;
        }

    }, [user]);


    return (
        <GlobalStateContext.Provider
            value={
                { loading, loaded, setLoading, setLoaded, error, setError, errorMessage, setErrorMessage, errorRedirect, setErrorRedirect, globalProducts, setGlobalProducts, isErrorReload, setIsErrorReload, user, setUser }
            }>
            {children}
        </GlobalStateContext.Provider>
    );
};
export const useGlobalContext = () => useContext(GlobalStateContext);