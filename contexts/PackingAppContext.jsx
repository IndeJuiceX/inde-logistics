"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';
import { useGlobalContext } from '@/contexts/GlobalStateContext';

export const PackingAppContext = createContext();

export const PackingAppProvider = ({ children, orderData }) => {
    const { setError, setErrorMessage, setIsErrorReload } = useGlobalContext();
    const [order, setOrder] = useState(orderData);
    const [packedData, setPackedData] = useState({
        parcelOption: '',
        weight: 0,
        custom_dimensions: { width: 0, height: 0, depth: 0 },
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
            weight: packedData.weight,
            parcel_type: packedData.parcelOption,

        }
        if (packedData.parcelOption === 'custom') {
            payload.custom_dimensions = packedData.custom_dimensions;
        }
        console.log('payload', payload);

        const response = await fetch(`/api/v1/admin/order-shipments/mark-packed`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        console.log('data', data);
    }

    const checkAllowedWeight = () => {
        if (packedData.weight <= 0) {
            setPackedData({ ...packedData, parcelOption: '' });
            setIsErrorReload(false);
            setError(true);
            setErrorMessage(`Weight cannot be less than 0g. Please enter a valid weight`);
            return true;
        }
        const couriers = order.shipment.courier;
        console.log('couriers', couriers);
        let parcelType = '';
        if (packedData.parcelOption === 'letter') {
            parcelType = couriers.find(type => type.package_type === "large letter");
        }
        if (packedData.parcelOption === 'large' || packedData.parcelOption === 'extra' || packedData.parcelOption === 'custom') {
            parcelType = couriers.find(type => type.package_type === "parcel");
        }
        console.log('parcelType', parcelType);
        if (parcelType) {

            const maxWeight = parcelType.max_weight_g;
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
                if (packedData.custom_dimensions.width > parcelType.max_width_cm
                    || packedData.custom_dimensions.height > parcelType.max_length_cm
                    || packedData.custom_dimensions.depth > parcelType.max_depth_cm) {
                    setPackedData({ ...packedData, parcelOption: '' });
                    setIsErrorReload(false);
                    setError(true);
                    setErrorMessage(`Dimensions exceed the limit of ${parcelType.max_width_cm}x${parcelType.max_length_cm}x${parcelType.max_depth_cm}cm. Please select the correct parcel type`);
                    return true;
                }
            }
        }
        return false;
    }
    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, packedData, setPackedData, handleLabelPrint }}>
            {children}
        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);