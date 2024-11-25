const parcelDimensions = {
    letter: { height: 20, width: 20, depth: 20 },
    parcel: { height: 30, width: 30, depth: 30 },
    extra_large_parcel: { height: 40, width: 40, depth: 40 },
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