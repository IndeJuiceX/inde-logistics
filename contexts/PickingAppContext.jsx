"use client";

import { createContext, useState, useContext } from 'react';

export const PickingAppContext = createContext();

export const PickingAppProvider = ({ children }) => {


    return (
        <PickingAppContext.Provider
            value={
                {}
            }>
            {children}
        </PickingAppContext.Provider>
    );
};
export const usePickingAppContext = () => useContext(PickingAppContext);