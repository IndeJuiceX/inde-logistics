import { getLoggedInUser } from '@/app/actions';
import crypto from 'crypto';

export async function authenticateAndAuthorize(request) {
  // Get the logged-in user session
  const user = await getLoggedInUser();

  // Check if the user is authenticated
  if (!user) {
    return { authorized: false, status: 401 };  // Not authenticated
  }

  // Extract user's role and vendor ID from the session
  const { role, vendor: sessionVendorId } = user;

  // Parse request to get the vendorId (if needed)
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  // Check if the user is an admin or if their vendorId matches the request vendorId
  if (role === 'admin' || sessionVendorId === vendorId) {
    return { authorized: true, user, status: 200 };  // User is authorized
  }

  // Return false if not authorized
  return { authorized: false, status: 403 };  // Access denied
}

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
