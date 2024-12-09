'use server';

import { getParcelType } from '@/services/utils/warehouse/courier';


export const parcelPayloadValidation = async (order, payload) => {
    console.log('parcelPayloadValidation payload', payload);

    const isValidParcelDimensions = await checkParcelDimensions(order, payload);


    const isAllowedWeight = await checkAllowedWeight(order, payload);
    console.log('parcelPayloadValidation isAllowedWeight', isAllowedWeight);
   

    if (isAllowedWeight.error || isValidParcelDimensions.error) {
        return { error: true, message: isAllowedWeight.message || isValidParcelDimensions.message };
    }


    let weight = payload.courier.weight;
    let width = payload.courier.width;
    let height = payload.courier.length;
    let depth = payload.courier.depth;

    weight = parseFloat(weight);
    width = parseFloat(width);
    height = parseFloat(height);
    depth = parseFloat(depth);

    if (isNaN(weight) || isNaN(width) || isNaN(height) || isNaN(depth)) {

        let errorMessage = 'Invalid parcel dimensions: ';
        if (isNaN(weight)) errorMessage += 'Weight is not a number. ';
        if (isNaN(width)) errorMessage += 'Width is not a number. ';
        if (isNaN(height)) errorMessage += 'Height is not a number. ';
        if (isNaN(depth)) errorMessage += 'Depth is not a number. ';

        return { error: true, message: errorMessage.trim() };
    }


    return false;
}



export const checkAllowedWeight = async (order, payload) => {
    const parcelType = payload.courier.courier_type;
    const weight = payload.courier.weight;
    const width = payload.courier.width;
    const length = payload.courier.length;
    const depth = payload.courier.depth;



    const isParcelTypeValid = await getParcelType(order, parcelType);
    if (weight <= 0) {
        return { error: true, message: 'Weight cannot be less than 0g. Please enter a valid weight' };
    }

    if (isParcelTypeValid) {
        const maxWeight = isParcelTypeValid.max_weight_g;
        if (weight > maxWeight) {

            return { error: true, message: `Weight exceeds the limit of ${maxWeight}g. Please select the correct parcel type` };
        }

        return false;
    }

}
export const checkParcelDimensions = async (order, payload) => {

    const getSelectedCourier = await getParcelType(order, payload.courier.courier_type);

    if (getSelectedCourier.error || !getSelectedCourier) {
        return { error: true, message: 'Parcel type is not found' };
    }

    const payloadWidth = payload.courier.width;
    const payloadLength = payload.courier.length;
    const payloadDepth = payload.courier.depth;
    const payloadWeight = payload.courier.weight;
    const payloadCourierType = payload.courier.courier_type;

    const maxWidth = getSelectedCourier.max_width_cm;
    const maxLength = getSelectedCourier.max_length_cm;
    const maxDepth = getSelectedCourier.max_depth_cm;

    if (payloadCourierType === 'custom') {
        if (payloadWidth > maxWidth
            || payloadLength > maxLength
            || payloadDepth > maxDepth) {
            return { error: true, message: `Dimensions exceed the limit of ${maxWidth}x${maxLength}x${maxDepth}cm. Please select the correct parcel type` };
        }
    }
    if (order?.shipping_code === 'RM-INT') {
        if (payloadWeight > 2000) //grams
        {
            return { error: true, message: `Weight exceeds the limit of 2000g. Please select the correct parcel type` };
        }
        if (payloadLength + payloadDepth + payloadWidth > 90) {
            return { error: true, message: `Height exceeds the limit of 90cm. Please select the correct parcel type` };
        }
        if (payloadLength > 60 || payloadDepth > 60 || payloadWidth > 60) {
            return { error: true, message: `Height exceeds the limit of 60cm. Please select the correct parcel type` };
        }
    }
    return false;
}