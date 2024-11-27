import { getParcelType } from '@/services/utils/courier';


export const parcelPayloadValidation = async (order, payload, packedData) => {
    const isAllowedWeight = await checkAllowedWeight(order, packedData);
    const isValidParcelDimensions = await checkParcelDimensions(order, payload, packedData);
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



export const checkAllowedWeight = async (order, packedData) => {
    
    const isParcelTypeValid = await getParcelType(order, packedData.parcelOption);
    if (packedData.courier.weight <= 0) {
        return { error: true, message: 'Weight cannot be less than 0g. Please enter a valid weight' };
    }

    if (isParcelTypeValid) {
        const maxWeight = isParcelTypeValid.max_weight_g;
        if (packedData.courier.weight > maxWeight) {

            return { error: true, message: `Weight exceeds the limit of ${maxWeight}g. Please select the correct parcel type` };
        }

        return false;
    }

}
export const checkParcelDimensions = async (order, payload, packedData) => {
    const isParcelTypeValid = await getParcelType(order, packedData.parcelOption);
    if (packedData.parcelOption === 'custom') {
        if (packedData.courier.width > isParcelTypeValid.max_width_cm
            || packedData.courier.length > isParcelTypeValid.max_length_cm
            || packedData.courier.depth > isParcelTypeValid.max_depth_cm) {
            return { error: true, message: `Dimensions exceed the limit of ${isParcelTypeValid.max_width_cm}x${isParcelTypeValid.max_length_cm}x${isParcelTypeValid.max_depth_cm}cm. Please select the correct parcel type` };
        }
    }
    if (order?.shipping_code === 'RM-INT') {
        if (payload.courier.weight > 2000) //grams
        {
            return { error: true, message: `Weight exceeds the limit of 2000g. Please select the correct parcel type` };
        }
        if (payload.courier.length + payload.courier.depth + payload.courier.width > 90) {
            return { error: true, message: `Height exceeds the limit of 90cm. Please select the correct parcel type` };
        }
        if (payload.courier.length > 60 || payload.courier.depth > 60 || payload.courier.width > 60) {
            return { error: true, message: `Height exceeds the limit of 60cm. Please select the correct parcel type` };
        }
    }
    return false;
}