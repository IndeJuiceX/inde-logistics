import { getItem, transactWriteItems, queryItems, updateItem, queryItemsWithPkAndSk, } from '@/services/external/dynamo/wrapper';
import { cleanResponseData } from '@/services/utils';


export const validateOrderShippingCode = async (vendorId, order) => {
    try {
        //get the vendor couriers 
        const vendorData = await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`)
        const vendor = vendorData?.data || null
        if (!vendor) {
            return { success: false, error: 'Vendor not found', details: "Invalid vendor id" }
        }
        const vendorCourier = vendor?.courier || null
        if (!vendorCourier) {
            return { success: false, error: 'Vendor Courier is not set', details: "Please set the vendor courier and try again" }
        }
        const courierNameKey = vendorCourier.toLowerCase().replace(/\s+/g, '');
        const courierData = await queryItemsWithPkAndSk(`COURIER#${courierNameKey}`, `CODE#${order.shipping_code}#`)

        const courierCodes = courierData?.data || null
        if (!courierCodes || courierCodes.length === 0) {
            //return { success: false, error: 'Invalid Shipping Code', details: "Please check shipping_code and try again" }
            return { success: false, error: 'Invalid shipping_code, Please check shipping_code and try again' }
        } //else {
        //     return { success: true, data: { 'shipping_code': code, 'courier': courierCodes[0].courier_name, 'shipping_id': courierCodes[0].inde_shipping_id } };
        // }
        if (order.buyer.country_code !== 'GB' && !order.shipping_code.includes('-INT')) {
            return { success: false, error: 'Invalid shipping_code for international shipment, Please check shipping_code and try again' }

        }
        if (order.buyer.country_code == 'GB' && order.shipping_code.includes('-INT')) {
            return { success: false, error: 'Invalid shipping_code for nationwide shipment, Please check shipping_code and try again' }

        }
        return { success: true }

    } catch (error) {
        console.error('Error in createOrder:', error);
        return {
            success: false,
            error: 'Server error.',
            details: error.message,
        };
    }
};

export const getCourierDetails = async (vendorId, code = 'RM-24') => {
    const vendorData = await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`)
    const vendor = vendorData?.data || null
    if (!vendor) {
        return { success: false, error: 'Vendor not found', details: "Invalid vendor id" }
    }
    const vendorCourier = vendor?.courier || null
    if (!vendorCourier) {
        return { success: false, error: 'Vendor Courier is not set', details: "Please set the vendor courier and try again" }
    }
    const courierNameKey = vendorCourier.toLowerCase().replace(/\s+/g, '');
    const courierData = await queryItemsWithPkAndSk(`COURIER#${courierNameKey}`, `CODE#${code}#`)
    const courierCodes = courierData?.data || null
    if (!courierCodes || courierCodes.length === 0) {
        return { success: false, error: 'Invalid Courier Code', details: "Courier code not known" }
    }
    return { success: true, data: cleanResponseData(courierCodes) }
}

export const getVendorShippingCodes = async (vendorId) => {
    const vendorData = await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`)
    const vendor = vendorData?.data || null
    if (!vendor) {
        return { success: false, error: 'Vendor not found', details: "Invalid vendor id" }
    }
    const vendorCourier = vendor?.courier || null
    if (!vendorCourier) {
        return { success: false, error: 'Vendor Courier is not set', details: "Please set the vendor courier and try again" }
    }
    const courierNameKey = vendorCourier.toLowerCase().replace(/\s+/g, '');
    const courierData = await queryItemsWithPkAndSk(`COURIER#${courierNameKey}`, `CODE#`)
    const courierCodesData = courierData?.data || null

    if (!courierCodesData || courierCodesData.length === 0) {
        //return { success: false, error: 'Invalid Shipping Code', details: "Please check shipping_code and try again" }
        return { success: false, error: 'Vendor Courier has no data set' }
    }
    // Extract unique shipping codes
    const uniqueShippingCodes = [...new Set(courierCodesData.map(codeData => codeData.shipping_code))];
    return { success: true, data: { courier_name: vendorCourier, shipping_codes: uniqueShippingCodes } }
}

