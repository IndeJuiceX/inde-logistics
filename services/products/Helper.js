import crypto from 'crypto';

// Function to generate the SK based on VendorId and vendor_sku
export const generateSK = (vendorId, vendor_sku) => {
    const input = `${vendorId}${vendor_sku}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return `PRODUCT#${hash.substring(0, 8)}`; // Take the first 8 characters of the hash
};
