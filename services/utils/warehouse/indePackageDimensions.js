'use server';

const parcelDimensions = {
    letter: { length: 29.2, width: 19.8, depth: 2 },
    parcel: { length: 23, width: 15.8, depth: 10.7 },
    extra_large_parcel: { length: 31, width: 23.8, depth: 8.5 },
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
export async function getParcelDimensions(type) {
    return parcelDimensions[type] || null;
}

export async function getShippingCost(code) {
    if (!shippingCost.hasOwnProperty(code)) {
        console.error(`Invalid shipping code: ${code}`);
        return null;
    }

    return shippingCost[code];
}