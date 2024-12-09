'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { getStationId } from '@/services/utils/warehouse/packingStation';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { getServiceCode } from '@/services/utils/warehouse/courier';
import { updateOrderShipment } from '@/services/data/order-shipment';
import { parcelPayloadValidation } from '@/services/utils/warehouse/packingValidations';
import { generateAndPrintLabel } from '@/services/utils/warehouse/printLabel';

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
    const [isValidForPrintLabel, setIsValidForPrintLabel] = useState(false);
    const [isGeneratedLabel, setIsGeneratedLabel] = useState(false);

    const [payloadCourier, setPayloadCourier] = useState({
        width: '0',
        length: '0',
        depth: '0',
        weight: '0',
    })

    useEffect(() => {
        if (currentErrorOrder) {
            setCurrentOrderShipment(currentErrorOrder.shipment);
            // console.log(currentErrorOrder.shipment);
            setPayloadCourier({
                width: currentErrorOrder.shipment.width_cm,
                length: currentErrorOrder.shipment.height_cm,
                depth: currentErrorOrder.shipment.depth_cm,
                weight: currentErrorOrder.shipment.weight_grams,
            });

            const checkValidForLabelPrint = !!currentErrorOrder.shipment.weight_grams;
            const checkLabelKeyAlreadyGenerated = !!currentErrorOrder.shipment.label_key && !!currentErrorOrder.shipment.tracking;

            setIsGeneratedLabel(checkLabelKeyAlreadyGenerated);
            setIsValidForPrintLabel(checkValidForLabelPrint);

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
    const updateWeightAndDimensions = async (updatedCourier) => {
        // setLoading(true);
        let service_code = await getServiceCode(currentErrorOrder, selectedParcelOption);
        const validationFormate = {
            parcelOption: selectedParcelOption,
            courier: {
                ...updatedCourier,
                service_code: service_code,
                weight: updatedCourier.weight,
            }
        }
        const validationResult = parcelPayloadValidation(currentErrorOrder, validationFormate, validationFormate);
        if (validationResult.error) {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(validationResult.message);
            setIsErrorReload(false);
            return;
        }

        const formattedCourier = {
            service_code: service_code,
            weight_grams: updatedCourier.weight,
            depth_cm: updatedCourier.depth,
            width_cm: updatedCourier.width,
            height_cm: updatedCourier.length,
        };

        const updateResult = await updateOrderShipment(currentErrorOrder.vendor_id, currentErrorOrder.vendor_order_id, formattedCourier);

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
    const printLabel = async () => {
        setLoading(true);
        const stationId = getStationId();
        if (stationId === null) {
            setIsSetStationId(false);
            return;
        }

        const printLabelResult = await generateAndPrintLabel(currentErrorOrder.vendor_id, currentErrorOrder.vendor_order_id, stationId);

        if (printLabelResult.success) {
            setIsGeneratedLabel(true);
            setIsReadyForDispatch(true);
            setLoading(false);
            setLoaded(true);
        }
        else {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(printLabelResult.error);
            setIsErrorReload(true);
        }
    }
    const handleCompleteOrder = async (withSignOut = false) => {
        setLoading(true);
        const vendorId = currentErrorOrder.vendor_id;
        const vendorOrderId = currentErrorOrder.vendor_order_id;
        const updateFields = {
            status: 'dispatched',
            error: 0,
            error_reason: ""
        }


        const response = await updateOrderShipment(vendorId, vendorOrderId, updateFields);
        if (response.success) {
            if (withSignOut) {
                await doLogOut();
            }
            else {
                // window.location.reload();
                window.location.href = '/warehouse/error';
            }
        }
        else {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(response.error);
            setIsErrorReload(true);
        }
    }
    return (
        <ErrorAppContext.Provider value={{ errorOrders, setErrorOrders, totalErrorOrders, setTotalErrorOrders, currentErrorOrder, setCurrentErrorOrder, currentErrorOrderIndex, setCurrentErrorOrderIndex, selectedParcelOption, setSelectedParcelOption, currentOrderShipment, setCurrentOrderShipment, payloadCourier, setPayloadCourier, updateWeightAndDimensions, isValidForPrintLabel, printLabel, isGeneratedLabel, handleCompleteOrder }}>
            {children}
        </ErrorAppContext.Provider>
    );
};

export const useErrorAppContext = () => useContext(ErrorAppContext);