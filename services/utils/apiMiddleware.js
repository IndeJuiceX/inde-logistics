import { decodeToken } from './token';
import { getVendorById } from '../data/vendor';
import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/app/actions';
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
    console.log(user)
    if (user && user.vendor) {
        // 3. User is authenticated
        // fetch the vendor from db and check it has status of active..
        const vendor = await getVendorById(user.vendor)
        if (vendor && vendor?.data?.status === 'Active') {
            return { authorized: true, user, status: 200 };
        }

    }

    // 4. If we reach this point, authentication failed
    return { authorized: false, status: 401 }; // Unauthorized
}

export function withAuthAndRole(handler, allowedRoles = []) {
    return async function (request, context) {
        try {
            const { authorized, user, status } = await authenticateAndAuthorize(request);
            if (!authorized) {
                return NextResponse.json({ error: 'Unauthorized' }, { status });
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            return handler(request, { ...context, user });
        } catch (error) {
            console.error('Error in authentication wrapper:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}

export function withApiLogging(handler) {
    return async function (request, context) {
        const startTime = Date.now();

        // Initialize variables to store request and response data
        let requestData = {};
        let responseData = {};
        let responseStatus = 200; // Default status
        let errorOccurred = false;

        try {
            // **1. Capture request data**
            requestData = {
                url: request.url,
                method: request.method,
                headers: Object.fromEntries(request.headers.entries()),
            };

            if (request.method !== 'GET' && request.method !== 'HEAD') {
                try {
                    requestData.body = await request.clone().json();
                } catch (error) {
                    requestData.body = null;
                }
            }

            // **2. Call the handler and capture the response**
            const result = await handler(request, context);

            responseStatus = result.status || 200;
            responseData = await result.json();

            // **3. Return the response**
            return result;
        } catch (error) {
            errorOccurred = true;
            responseStatus = error.status || 500;
            responseData = { error: error.message || 'Internal Server Error' };

            // **4. Return the error response**
            return NextResponse.json(responseData, { status: responseStatus });
        } finally {
            // **5. After response is sent, save the API call log**
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Get user information from context
            const user = context.user || null;
            const vendorId = user?.vendor || null;
            const dataToSave = {
                vendorId,
                endpoint: request.url,
                method: request.method,
                requestData,
                responseData,
                status: responseStatus,
                timestamp: new Date(startTime).toISOString(),
                duration,
                error: errorOccurred,
            }
            console.log(dataToSave)
            // **6. Save the API call log**
            //await saveApiCall();
        }
    };
}


/**
 * export async function saveApiCall(apiCallData) {
  const {
    vendorId,
    endpoint,
    method,
    requestData,
    responseData,
    status,
    timestamp,
    duration,
    error,
  } = apiCallData;

  if (!vendorId) {
    // If vendorId is not available, do not save the log
    return;
  }

  const pk = `VENDOR#${vendorId}`;
  const sk = `APICALL#${timestamp}#${uuidv4()}`;

  const item = {
    pk,
    sk,
    endpoint,
    method,
    status,
    requestData,
    responseData,
    timestamp,
    duration,
    error, // true or false
  };

  try {
    await dynamoDbClient.send(
      new PutCommand({
        TableName: 'ApiCallLogs',
        Item: item,
      })
    );
  } catch (dbError) {
    console.error('Error saving API call log:', dbError);
    // Handle logging failures as needed (e.g., send to an error tracking service)
  }
}
 */