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
        weight: 0,
        courier: { width: 0, height: 0, depth: 0 },
    });

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
            weight: packedData.weight,
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
        if (packedData.weight <= 0) {
            setPackedData({ ...packedData, parcelOption: '' });
            setIsErrorReload(false);
            setError(true);
            setErrorMessage(`Weight cannot be less than 0g. Please enter a valid weight`);
            return true;
        }
      

        if (isParcelTypeValid) {

            const maxWeight = isParcelTypeValid.max_weight_g;
            if (packedData.weight > maxWeight) {
                setPackedData({ ...packedData, parcelOption: '' });
                // setEnteredValue(0);
                setPackedData({ ...packedData, weight: 0 });
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
    
    useEffect(() => {
        console.log('order', order);
    }, [order]);
    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, packedData, setPackedData, handleLabelPrint }}>
            {children}
        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);