import { getLoggedInUser } from '@/app/actions';
import crypto from 'crypto';
import { decodeToken } from './token';
import { getVendorById } from '../data/vendor';

export async function authenticateAndAuthorize(request) {
  let user = null;

  // 1. Try to get the user from the session (for browser-based requests)
  try {
    user = await getLoggedInUser();
  } catch (error) {
    // Log the error if needed
    console.error('Error getting logged-in user from session:', error);
  }

  // 2. If user is not in the session, check for Authorization header (for API requests)
  if (!user) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, status: 401 }; // Unauthorized
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      // Verify the token and extract user info
      user = decodeToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return { authorized: false, status: 401 }; // Unauthorized
    }
  }

  if (user && user.vendorId) {
    // 3. User is authenticated
    // fetch the vendor from db and check it has status of active..
    const vendor = await getVendorById(user.vendorId)
    if (vendor && vendor?.data?.status === 'Active') {
      return { authorized: true, user, status: 200 };
    }

  }

  // 4. If we reach this point, authentication failed
  return { authorized: false, status: 401 }; // Unauthorized
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
