const parcelDimensions = {
    letter: { heightInMms: 20, widthInMms: 30, depthInMms: 2 },
    parcel: { heightInMms: 40, widthInMms: 60, depthInMms: 30 },
    extra_large_parcel: { heightInMms: 80, widthInMms: 120, depthInMms: 60 },
};
const shippingCost = {
    'RM-24': 3.99,
    'RM-48': 2.45,
    'OTA': 12.99,

}
/**
 * Gets dimensions for a given parcel type.
 * @param {string} type - The parcel type (e.g., 'letter', 'parcel', 'extra parcel').
 * @returns {object|null} Dimensions object or null if not found.
 */
export function getParcelDimensions(type) {
    return parcelDimensions[type] || null;
}

export function getShippingCost(code) {
    if (!shippingCost.hasOwnProperty(code)) {
        console.error(`Invalid shipping code: ${code}`);
        return null;
    }
    console.log('code', code);
    console.log('shippingCost', shippingCost);
    console.log('shippingCost[code]', shippingCost[code]);
    return shippingCost[code];
}