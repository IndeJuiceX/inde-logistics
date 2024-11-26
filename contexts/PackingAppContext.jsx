"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { getParcelDimensions } from '@/services/utils/indePackageDimensions';
import { getServiceCode } from '@/services/utils/courier';
import { updateOrderShipment } from '@/services/data/order-shipment';
import { checkAllowedWeight, checkParcelDimensions } from '@/services/utils/packingValidations';
export const PackingAppContext = createContext();

export const PackingAppProvider = ({ children, orderData }) => {
    const { setError, setErrorMessage, setIsErrorReload, setLoading, setLoaded } = useGlobalContext();
    const [order, setOrder] = useState(orderData);
    const [packedData, setPackedData] = useState({
        parcelOption: '',
        courier: { width: '0', height: '0', depth: '0', weight: '0' },
    });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentClicked, setCurrentClicked] = useState('');
    const [enteredValue, setEnteredValue] = useState('');
    const [isValidForPrintLabel, setIsValidForPrintLabel] = useState(false);


    const handleSignOut = async () => {
        await doLogOut();
    };

    const handleLabelPrint = async () => {
        setLoading(true);
        const payload = {
            vendor_id: order.vendor_id,
            vendor_order_id: order.vendor_order_id,
        }
        if (packedData.parcelOption === 'custom') {
            payload.courier = packedData.courier;
        }
        else {
            payload.courier = getParcelDimensions(packedData.parcelOption);

        }
        // payload.weight.courier = packedData.weight;
        payload.courier = {
            ...payload.courier,
            weight: packedData.courier.weight,
            service_code: getServiceCode(order, packedData.parcelOption),
        };
        const isValidWeight = checkAllowedWeight(order, packedData);
        const isValidParcelDimensions = checkParcelDimensions(order, payload, packedData);
        if (isValidWeight.error || isValidParcelDimensions.error) {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(isValidWeight.message || isValidParcelDimensions.message);
            setIsErrorReload(false);
            setPackedData({
                ...packedData,
                courier: {
                    ...packedData.courier,
                    weight: 0,
                    parcelOption: '',
                    width: 0,
                    height: 0,
                    depth: 0,
                }
            });
            return;
        }

        let service_code = payload.courier.service_code;
        let weight = payload.courier.weight;
        let width = payload.courier.width;
        let height = payload.courier.height;
        let depth = payload.courier.depth;

        weight = parseFloat(weight);
        width = parseFloat(width);
        height = parseFloat(height);
        depth = parseFloat(depth);

        if (isNaN(weight) || isNaN(width) || isNaN(height) || isNaN(depth)) {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage('Invalid parcel dimensions');
            setIsErrorReload(true);
            return;
        }
        const formattedCourier = {
            service_code,
            weight_grams: weight,
            depth_cm: depth,
            width_cm: width,
            height_cm: height,
        };
        const updateResult = await updateOrderShipment(order.vendor_id, order.vendor_order_id, formattedCourier);
        if (updateResult.success) {
            setIsValidForPrintLabel(true);
        }
        else {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(updateResult.error);
            setIsErrorReload(true);
        }
    }


    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newInput = enteredValue.length > 0 ? enteredValue.slice(0, -1) : '';
            setPackedData(prevState => ({
                ...prevState,
                courier: {
                    ...prevState.courier,
                    [currentClicked]: newInput
                }
            }));
            setEnteredValue(newInput);
        } else if (input === 'ok') {
            setPackedData(prevState => ({
                ...prevState,
                courier: {
                    ...prevState.courier,
                    [currentClicked]: parseInt(enteredValue)
                }
            }));

            setIsOpenModal(false);
            if (currentClicked === 'weight') {
                handleLabelPrint();
            }
        } else {
            const newNumberInput = enteredValue + input;

            const parsedValue = parseInt(newNumberInput, 10);
            setPackedData(prevState => ({
                ...prevState,
                courier: {
                    ...prevState.courier,
                    [currentClicked]: parsedValue
                }
            }));
            setEnteredValue(newNumberInput);
        }
    };


    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, packedData, setPackedData, handleLabelPrint, handleNumberEntered, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue, isValidForPrintLabel, setIsValidForPrintLabel }}>
            {children}
        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);