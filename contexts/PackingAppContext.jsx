'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { doLogOut } from '@/app/actions';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { getParcelDimensions } from '@/services/utils/warehouse/indePackageDimensions';
import { getServiceCode } from '@/services/utils/warehouse/courier';
import { updateOrderShipment } from '@/services/data/order-shipment';
import { parcelPayloadValidation } from '@/services/utils/warehouse/packingValidations';
import CheckSetStationId from '@/components/warehouse/packing/CheckSetStationId';
import { getStationId } from '@/services/utils/warehouse/packingStation';
import { generateAndPrintLabel } from '@/services/utils/warehouse/printLabel';

export const PackingAppContext = createContext();

export const PackingAppProvider = ({ children, orderData }) => {
    const { setError, setErrorMessage, setIsErrorReload, setLoading, setLoaded } = useGlobalContext();
    const [order, setOrder] = useState(orderData);
    const [packedData, setPackedData] = useState({
        parcelOption: '',
        courier: { width: '0', length: '0', depth: '0', weight: '0' },
    });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentClicked, setCurrentClicked] = useState('');
    const [enteredValue, setEnteredValue] = useState('');
    const [isValidForPrintLabel, setIsValidForPrintLabel] = useState(false);
    const [isReadyForDispatch, setIsReadyForDispatch] = useState(false);
    const [isSetStationId, setIsSetStationId] = useState(true);

    useEffect(() => {
        const checkSetStationId = getStationId();
        console.log('checkSetStationId', checkSetStationId);
        if (checkSetStationId) {
            setIsSetStationId(true);
        } else {
            setIsSetStationId(false);
        }
    }, []);

    const handleSignOut = async () => {
        await doLogOut();
    };

    const updateWeightAndDimensions = async () => {
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
            service_code: await getServiceCode(order, packedData.parcelOption),
        };

        let service_code = payload.courier.service_code;
        const validationResult = parcelPayloadValidation(order, payload, packedData);
        if (validationResult.error) {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(validationResult.message);
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

        const formattedCourier = {
            service_code: service_code,
            weight_grams: payload.courier.weight,
            depth_cm: payload.courier.depth,
            width_cm: payload.courier.width,
            height_cm: payload.courier.length,
        };

        const updateResult = await updateOrderShipment(order.vendor_id, order.vendor_order_id, formattedCourier);

        if (updateResult.success) {
            setLoading(false);
            setLoaded(true);
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
                updateWeightAndDimensions();
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

    const printLabel = async () => {
        const stationId = getStationId();
        if (stationId === null) {
            setIsSetStationId(false);
            return;
        }
        const printLabelResult = await generateAndPrintLabel(order.vendor_id, order.vendor_order_id, stationId);
        console.log('printLabel response', printLabelResult);
    }
    useEffect(() => {
        console.log('isSetStationId', isSetStationId);
    }, [isSetStationId]);
    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, packedData, setPackedData, handleNumberEntered, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue, isValidForPrintLabel, setIsValidForPrintLabel, isReadyForDispatch, setIsReadyForDispatch, printLabel, isSetStationId, setIsSetStationId }}>
            {!isSetStationId && <CheckSetStationId />}
            {isSetStationId && children}

        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);