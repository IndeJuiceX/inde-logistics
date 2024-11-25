"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { getParcelDimensions } from '@/services/utils/indePackageDimensions';
import { getParcelType, getServiceCode } from '@/services/utils/courier';
export const PackingAppContext = createContext();

export const PackingAppProvider = ({ children, orderData }) => {
    const { setError, setErrorMessage, setIsErrorReload } = useGlobalContext();
    const [order, setOrder] = useState(orderData);
    const [packedData, setPackedData] = useState({
        parcelOption: '',
        courier: { width: 0, height: 0, depth: 0, weight: 0 },
    });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentClicked, setCurrentClicked] = useState('');
    const [enteredValue, setEnteredValue] = useState('');



    const handleSignOut = async () => {
        await doLogOut();
    };
    console.log('couriers', order.shipment.courier);
    const handleLabelPrint = async () => {
        const isWeightValid = checkAllowedWeight();
        if (isWeightValid) {
            return;
        }
        const payload = {
            vendor_id: order.vendor_id,
            vendor_order_id: order.vendor_order_id,
            // weight: packedData.weight,
            // parcel_type: packedData.parcelOption,

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
        const response = await fetch(`/api/v1/admin/order-shipments/update`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        console.log('data', data);
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
                // setEnteredValue(0);
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
    const handleNumberEntered = (input) => {
        if (input === 'backspace') {
            const newInput = enteredValue.length > 0 ? enteredValue.slice(0, -1) : '';
            setEnteredValue(newInput);
        } else if (input === 'ok') {
            console.log('input', input);
            console.log('currentClicked', currentClicked);
            setPackedData({ ...packedData, courier: { ...packedData.courier, [currentClicked]: enteredValue } });
            setIsOpenModal(false);
        } else {
            const newNumberInput = enteredValue + input;
            const parsedValue = parseInt(newNumberInput, 10);
            setEnteredValue(newNumberInput);
        }
    };

    useEffect(() => {
        console.log('order', order);
    }, [order]);
    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, packedData, setPackedData, handleLabelPrint, handleNumberEntered, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue }}>
            {children}
        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);