'use client';


import { createContext, useState, useContext, useEffect } from 'react';
import { getStationId } from '@/services/utils/warehouse/packingStation';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
export const ErrorAppContext = createContext();

export const ErrorAppProvider = ({ children, errorData }) => {
    const { setError, setErrorMessage, setIsErrorReload, setLoading, setLoaded } = useGlobalContext();
    const [isSetStationId, setIsSetStationId] = useState(true);

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
    useEffect(() => {
        const checkSetStationId = getStationId();

        if (checkSetStationId) {
            setIsSetStationId(true);
        } else {
            setIsSetStationId(false);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const updateWeightAndDimensions = async () => {
        // setLoading(true);
        const payload = {
            vendor_id: currentErrorOrder.vendor_id,
            vendor_order_id: currentErrorOrder.vendor_order_id,
            courier: {
                width: payloadCourier.width,
                length: payloadCourier.length,
                depth: payloadCourier.depth,
                weight: payloadCourier.weight,
            }
        }
        console.log('payload', payload);
        // if (packedData.parcelOption === 'custom') {
        //     payload.courier = packedData.courier;
        // }
        // else {
        //     payload.courier = getParcelDimensions(packedData.parcelOption);
        // }
        // // payload.weight.courier = packedData.weight;
        // payload.courier = {
        //     ...payload.courier,
        //     weight: packedData.courier.weight,
        //     service_code: await getServiceCode(order, packedData.parcelOption),
        // };

        // let service_code = payload.courier.service_code;

        // const validationResult = parcelPayloadValidation(order, payload, packedData);
        // if (validationResult.error) {
        //     setLoading(false);
        //     setLoaded(true);
        //     setError(true);
        //     setErrorMessage(validationResult.message);
        //     setIsErrorReload(false);
        //     setPackedData({
        //         ...packedData,
        //         courier: {
        //             ...packedData.courier,
        //             weight: 0,
        //             parcelOption: '',
        //             width: 0,
        //             height: 0,
        //             depth: 0,
        //         }
        //     });
        //     return;
        // }

        // const formattedCourier = {
        //     service_code: service_code,
        //     weight_grams: payload.courier.weight,
        //     depth_cm: payload.courier.depth,
        //     width_cm: payload.courier.width,
        //     height_cm: payload.courier.length,
        // };

        // const updateResult = await updateOrderShipment(order.vendor_id, order.vendor_order_id, formattedCourier);


        // if (updateResult.success) {
        //     setLoading(false);
        //     setLoaded(true);
        //     setIsValidForPrintLabel(true);
        // }
        // else {
        //     setLoading(false);
        //     setLoaded(true);
        //     setError(true);
        //     setErrorMessage(updateResult.error);
        //     setIsErrorReload(true);
        // }
    }
    return (
        <ErrorAppContext.Provider value={{ errorOrders, setErrorOrders, totalErrorOrders, setTotalErrorOrders, currentErrorOrder, setCurrentErrorOrder, currentErrorOrderIndex, setCurrentErrorOrderIndex, selectedParcelOption, setSelectedParcelOption, currentOrderShipment, setCurrentOrderShipment, payloadCourier, setPayloadCourier, updateWeightAndDimensions }}>
            {children}
        </ErrorAppContext.Provider>
    );
};

export const useErrorAppContext = () => useContext(ErrorAppContext);