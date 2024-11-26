import { getParcelType } from '@/services/utils/courier';

export const checkAllowedWeight = (order, packedData) => {
    console.log('checkAllowedWeight order', order);
    console.log('checkAllowedWeight packedData', packedData);
    const isParcelTypeValid = getParcelType(order, packedData.parcelOption);
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
export const checkParcelDimensions = (order, payload, packedData) => {
    const isParcelTypeValid = getParcelType(order, packedData.parcelOption);
    if (packedData.parcelOption === 'custom') {
        if (packedData.courier.width > isParcelTypeValid.max_width_cm
            || packedData.courier.height > isParcelTypeValid.max_length_cm
            || packedData.courier.depth > isParcelTypeValid.max_depth_cm) {
            return { error: true, message: `Dimensions exceed the limit of ${isParcelTypeValid.max_width_cm}x${isParcelTypeValid.max_length_cm}x${isParcelTypeValid.max_depth_cm}cm. Please select the correct parcel type` };
        }
    }
    if (order?.shipping_code === 'RM-INT') {
        if (payload.courier.weight > 2000) //grams
        {
            return { error: true, message: `Weight exceeds the limit of 2000g. Please select the correct parcel type` };
        }
        if (payload.courier.height + payload.courier.depth + payload.courier.width > 90) {
            return { error: true, message: `Height exceeds the limit of 90cm. Please select the correct parcel type` };
        }
        if (payload.courier.height > 60 || payload.courier.depth > 60 || payload.courier.width > 60) {
            return { error: true, message: `Height exceeds the limit of 60cm. Please select the correct parcel type` };
        }
    }
    return false;
}