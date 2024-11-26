"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { getParcelDimensions } from '@/services/utils/indePackageDimensions';
import { getParcelType, getServiceCode } from '@/services/utils/courier';
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
        const isWeightValid = checkAllowedWeight();
        const isParcelDimensionsValid = checkParcelDimensions(payload);
        console.log('isWeightValid', isWeightValid);
        console.log('isParcelDimensionsValid', isParcelDimensionsValid);
        if (isWeightValid || isParcelDimensionsValid) {
            setLoading(false);
            setLoaded(true);
            return;
        }
        const response = await fetch(`/api/v1/admin/order-shipments/update`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
            setIsValidForPrintLabel(true);
        }
        setLoading(false);
        setLoaded(true);
    }

    const checkAllowedWeight = () => {
        const isParcelTypeValid = getParcelType(order, packedData.parcelOption);
        if (packedData.courier.weight <= 0) {
            setPackedData({ ...packedData, parcelOption: '' });
            setIsErrorReload(false);
            setError(true);
            setErrorMessage(`Weight cannot be less than 0g. Please enter a valid weight`);
            return true;
        }


        if (isParcelTypeValid) {

            const maxWeight = isParcelTypeValid.max_weight_g;
            if (packedData.courier.weight > maxWeight) {
                setPackedData({ ...packedData, parcelOption: '' });
                setPackedData({ ...packedData, courier: { ...packedData.courier, weight: 0 } });
                setIsErrorReload(false);
                setError(true);
                setErrorMessage(`Weight exceeds the limit of ${maxWeight}g. Please select the correct parcel type`);
                return true;
            }
            if (packedData.parcelOption === 'custom') {
                if (packedData.courier.width > isParcelTypeValid.max_width_cm
                    || packedData.courier.height > isParcelTypeValid.max_length_cm
                    || packedData.courier.depth > isParcelTypeValid.max_depth_cm) {
                    setPackedData({ ...packedData, parcelOption: '' });
                    setIsErrorReload(false);
                    setError(true);
                    setErrorMessage(`Dimensions exceed the limit of ${isParcelTypeValid.max_width_cm}x${isParcelTypeValid.max_length_cm}x${isParcelTypeValid.max_depth_cm}cm. Please select the correct parcel type`);
                    return true;
                }
            }
        }
        return false;
    }
    const checkParcelDimensions = (payload) => {
        const isParcelTypeValid = getParcelType(order, payload.parcelOption);
        if (order?.shipping_code === 'RM-INT') {
            if (payload.courier.weight > 2000) //grams
            {
                setPackedData({ ...packedData, parcelOption: '' });
                setIsErrorReload(false);
                setError(true);
                setErrorMessage(`Weight exceeds the limit of 2000g. Please select the correct parcel type`);
                return true;
            }
            if (payload.courier.height + payload.courier.depth + payload.courier.width > 90) {
                setPackedData({ ...packedData, parcelOption: '' });
                setIsErrorReload(false);
                setError(true);
                setErrorMessage(`Height exceeds the limit of 90cm. Please select the correct parcel type`);
                return true;
            }
            if (payload.courier.height > 60 || payload.courier.depth > 60 || payload.courier.width > 60) {
                setPackedData({ ...packedData, parcelOption: '' });
                setIsErrorReload(false);
                setError(true);
                setErrorMessage(`Height exceeds the limit of 60cm. Please select the correct parcel type`);
                return true;
            }
        }
        return false;
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