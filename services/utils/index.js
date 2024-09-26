import { getLoggedInUser } from '@/app/actions';

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
