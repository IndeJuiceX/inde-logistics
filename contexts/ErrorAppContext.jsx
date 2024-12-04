'use client';


import { createContext, useState, useContext, useEffect } from 'react';

export const ErrorAppContext = createContext();

export const ErrorAppProvider = ({ children, errorData }) => {
    const [errorOrders, setErrorOrders] = useState(errorData);
    const [totalErrorOrders, setTotalErrorOrders] = useState(errorData?.length || 0);
    const [currentErrorOrderIndex, setCurrentErrorOrderIndex] = useState(0);
    const [currentErrorOrder, setCurrentErrorOrder] = useState(errorData[currentErrorOrderIndex]);
    const [currentOrderShipment, setCurrentOrderShipment] = useState(null);
    const [selectedParcelOption, setSelectedParcelOption] = useState('');
    const [payloadCourier, setPayloadCourier] = useState({
        width: '0',
        length: '0',
        depth: '0',
        weight: '0',
    })

    useEffect(() => {
        if (currentErrorOrder) {
            setCurrentOrderShipment(currentErrorOrder.shipment);
            console.log(currentErrorOrder.shipment);
        }
    }, [currentErrorOrder]);

    return (
        <ErrorAppContext.Provider value={{ errorOrders, setErrorOrders, totalErrorOrders, setTotalErrorOrders, currentErrorOrder, setCurrentErrorOrder, currentErrorOrderIndex, setCurrentErrorOrderIndex, selectedParcelOption, setSelectedParcelOption, currentOrderShipment, setCurrentOrderShipment, payloadCourier, setPayloadCourier }}>
            {children}
        </ErrorAppContext.Provider>
    );
};

export const useErrorAppContext = () => useContext(ErrorAppContext);