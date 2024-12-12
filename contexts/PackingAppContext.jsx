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

export const PackingAppProvider = ({ children, orderData, errorQueue }) => {



    const { setError, setErrorMessage, setIsErrorReload, setLoading, loading, setLoaded } = useGlobalContext();
    const currentOrder = errorQueue ? orderData[0] : orderData;
    const [isErrorQueue, setIsErrorQueue] = useState(errorQueue);
    const [order, setOrder] = useState(currentOrder);

    const [packedData, setPackedData] = useState({
        parcelOption: '',
        courier: { width: '0', length: '0', depth: '0', weight: '0' },
    });
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [currentClicked, setCurrentClicked] = useState('');
    const [enteredValue, setEnteredValue] = useState('');
    const [isValidForPrintLabel, setIsValidForPrintLabel] = useState(false);
    const [isReadyForDispatch, setIsReadyForDispatch] = useState(order?.shipment?.label_key != null && order?.shipment?.tracking != null);
    const [isSetStationId, setIsSetStationId] = useState(true);
    const [isGeneratedLabel, setIsGeneratedLabel] = useState(order?.shipment?.label_key != null && order?.shipment?.tracking != null);

    const [currentErrorIndex, setCurrentIndex] = useState(0);
    const [totalErrorOrders, setTotalErrorOrders] = useState(isErrorQueue ? orderData.length : 0);

    useEffect(() => {
        const checkSetStationId = getStationId();

        if (checkSetStationId) {
            setIsSetStationId(true);
        } else {
            setIsSetStationId(false);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            payload.courier = await getParcelDimensions(packedData.parcelOption);

        }
        // payload.weight.courier = packedData.weight;
        payload.courier = {
            ...payload.courier,
            courier_type: packedData.parcelOption,
            weight: packedData.courier.weight,
            service_code: await getServiceCode(order, packedData.parcelOption),
        };

        let service_code = payload.courier.service_code;

        const validationResult = await parcelPayloadValidation(order, payload);

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
                    length: 0,
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


    const printLabel = async () => {
        setLoading(true);
        const stationId = getStationId();
        if (stationId === null) {
            setIsSetStationId(false);
            return;
        }
        const printLabelResult = await generateAndPrintLabel(order.vendor_id, order.vendor_order_id, stationId);

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
            setErrorMessage(printLabelResult.error || 'Something went wrong, Please try again');
            setIsErrorReload(true);
        }
    }

    const handleCompleteOrder = async (withSignOut = false) => {
        setLoading(true);
        const vendorId = order.vendor_id;
        const vendorOrderId = order.vendor_order_id;
        const timestamp = new Date().toISOString()
        const updateFields = {
            status: 'dispatched',           
        }

        if (isErrorQueue) {
            updateFields.error_reason = ''
            updateFields.error = 0
        }

        const response = await updateOrderShipment(vendorId, vendorOrderId, updateFields);
        if (response.success) {
            if (withSignOut) {
                await doLogOut();
            }
            else {
                window.location.reload();
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

    const addToRequireAttentionQueue = async (reason) => {
        setLoading(true);

        const error_reason = reason;
        // Validate that vendor_id, stock_shipment_id, and item are present
        if (!order.vendor_id || !order.vendor_order_id) {
            setError(true);
            setErrorMessage('Something went wrong, Please reload the page');
            setIsErrorReload(true);
        }

        // Prepare the arguments array
        // const args = [order.vendor_id, order.vendor_order_id];
        let isError = false
        if (error_reason && error_reason != '' && error_reason !== undefined) {
            //args.push(error_reason);
            isError= true
        }
        const updatedFields = {}
        if(isError){
            updatedFields.error = 1
            updatedFields.error_reason = error_reason
        }

        const data = await updateOrderShipment(order.vendor_id, order.vendor_order_id , updatedFields);

        if (data.success) {
            window.location.reload();
        }
        else {
            setLoading(false);
            setLoaded(true);
            setError(true);
            setErrorMessage(data.error);
            setIsErrorReload(true);
        }
    }
    return (
        <PackingAppContext.Provider
            value={{ handleSignOut, order, setOrder, packedData, setPackedData, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue, isValidForPrintLabel, setIsValidForPrintLabel, isReadyForDispatch, setIsReadyForDispatch, printLabel, isSetStationId, setIsSetStationId, isGeneratedLabel, handleCompleteOrder, addToRequireAttentionQueue, updateWeightAndDimensions, isErrorQueue, setIsErrorQueue, orderData, currentErrorIndex, setCurrentIndex, totalErrorOrders, setTotalErrorOrders }}>
            {!isSetStationId && <CheckSetStationId />}
            {isSetStationId && children}

        </PackingAppContext.Provider>
    );
};
export const usePackingAppContext = () => useContext(PackingAppContext);