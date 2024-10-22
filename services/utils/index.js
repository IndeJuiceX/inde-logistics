import { getLoggedInUser } from '@/app/actions';
import crypto from 'crypto';

export function generateShipmentId(vendorId) {
  const timestamp = Date.now().toString(36);  // Convert timestamp to a base36 string (more compact)
  const randomPart = Math.random().toString(36).substring(2, 4);  // Generate 2 random characters

  // Combine vendorId (shortened), timestamp, and random part to get an 8-char ID
  const shipmentId = (vendorId.substring(0, 3) + timestamp + randomPart).substring(0, 8);

  return shipmentId;
}

export function generateOrderId(vendorId, orderId) {

  if (orderId) {
    const input = `${vendorId}${orderId}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash.substring(0, 8);
  }
  const timestamp = Date.now().toString(36);  // Convert timestamp to a base36 string (more compact)
  const randomPart = Math.random().toString(36).substring(2, 4);  // Generate 2 random characters

  // Combine vendorId (shortened), timestamp, and random part to get an 8-char ID
  const uniqueId = (vendorId.substring(0, 3) + timestamp + randomPart).substring(0, 8);
  return uniqueId;
}
export const generateProductId = (vendorId, vendor_sku) => {
  const input = `${vendorId}${vendor_sku}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return hash.substring(0, 8); // Take the first 8 characters of the hash
};

/**
 * Cleans the data by removing the sk, pk, and entity_type properties.
 * @param {Array|Object} data - The data to be cleaned.
 * @returns {Array|Object} - The cleaned data.
 */
/*export const cleanResponseData = (data) => {
  const removeKeys = ({ sk, pk, entity_type, ...rest }) => rest;

  if (Array.isArray(data)) {
      return data.map(removeKeys);
  } else if (typeof data === 'object' && data !== null) {
      return removeKeys(data);
  } else {
      throw new Error('Invalid data type. Expected an array or object.');
  }
};*/
export const cleanResponseData = (data, additionalKeys = []) => {
  const removeKeys = (obj) => {
    const keysToRemove = ['sk', 'pk', 'entity_type', ...additionalKeys];
    const cleanedObj = { ...obj };
    keysToRemove.forEach(key => {
      if (key in cleanedObj) {
        delete cleanedObj[key];
      }
    });
    return cleanedObj;
  };

  if (Array.isArray(data)) {
    return data.map(removeKeys);
  } else if (typeof data === 'object' && data !== null) {
    return removeKeys(data);
  } else {
    throw new Error('Invalid data type. Expected an array or object.');
  }
};