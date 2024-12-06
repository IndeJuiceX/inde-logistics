import { decodeToken } from './token';
import { getVendorById } from '../data/vendor';
import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/app/actions';
import { sendLogToFirehose } from '../external/firehose';
import { v4 as uuidv4 } from 'uuid';

export async function authenticateAndAuthorize(request) {
    let user = null;
    let source;
    // 1. Try to get the user from the session (for browser-based requests)
    try {
        user = await getLoggedInUser();
        source = 'app'
    } catch (error) {
        // Log the error if needed
        console.error('Error getting logged-in user from session:', error);
    }

    // 2. If user is not in the session, check for Authorization header (for API requests)
    if (!user) {
        const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7); // Remove 'Bearer '

            try {
                // Verify the token and extract user info
                user = decodeToken(token);
                source = 'token';
            } catch (error) {
                console.error('Error verifying token:', error);
                return { authorized: false, status: 401 }; // Unauthorized
            }
        } else {
            return { authorized: false, status: 401 };
        }
    }


    if (user) {
        if (user.vendor) {
            const vendor = await getVendorById(user.vendor)
            if (vendor && vendor?.data?.status.toLowerCase() === 'active') {
                return { authorized: true, user, source, status: 200 };
            }
        }
        if (user.role === 'admin' || user.role === 'warehouse') {
            return { authorized: true, user, source, status: 200 };
        }


    }
   
    // 4. If we reach this point, authentication failed
    return { authorized: false, status: 401 }; // Unauthorized
}


export function withAuthAndLogging(handler, allowedRoles = []) {
    return async function (request, context = {}) {
        const startTime = Date.now();
        let response;
        let responseData = {};
        let responseStatus = 200;
        let errorOccurred = false;
        let user = null;
        let vendorId = null;
        let requestData = {};
        let requestFrom = null;
        let endpoint = null;
        let logType = null;

        try {
            // **Capture request data**
            const urlObj = new URL(request.url);
            endpoint = urlObj?.pathname?.startsWith('/api/v1')
                ? urlObj.pathname
                : `/api/v1${urlObj.pathname}`; // Ensure API version part
            requestData = {
                url: request.url,
                method: request.method,
                //headers: Object.fromEntries(request.headers.entries()),
            };

            if (request.method === 'GET' && urlObj.search) {
                requestData.params = Object.fromEntries(
                    urlObj.searchParams.entries()
                ); // Capture query params for GET
            } else if (request.method !== 'GET' && request.method !== 'HEAD') {
                try {
                    requestData.payload = await request.clone().json();
                } catch {
                    requestData.payload = null;
                }
            }

            // **Authenticate and authorize**
            const {
                authorized,
                user: authUser,
                source,
                status,
            } = await authenticateAndAuthorize(request);
            if (!authorized) {
                responseStatus = status;
                responseData = { error: 'Unauthorized' };
                errorOccurred = true;
                return NextResponse.json(responseData, { status: responseStatus });
            }

            user = authUser;
            vendorId = user?.vendor;
            requestFrom = source;
            logType = user.role;
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                responseStatus = 403;
                responseData = { error: 'Forbidden' };
                errorOccurred = true;
                return NextResponse.json(responseData, { status: responseStatus });
            }

            // **Call the handler**
            response = await handler(request, { ...context, user });

            responseStatus = response.status || 200;

            // **Capture response data**
            const responseClone = response.clone();
            try {
                responseData = await responseClone.json();
            } catch {
                responseData = null;
            }

            return response;
        } catch (error) {
            errorOccurred = true;
            responseStatus = error.status || 500;
            responseData = { error: error.message || 'Internal Server Error' };
            return NextResponse.json(responseData, { status: responseStatus });
        } finally {
            const endTime = Date.now();
            const duration = endTime - startTime;

            if (endpoint?.startsWith('/api/v1/vendor')) {
                // Prepare data for logging
                const dataToSave = {
                    vendor_id: vendorId,
                    user: requestFrom == 'app' ? user.email : 'token',
                    endpoint,
                    method: request.method,
                    request_data: JSON.stringify(requestData),
                    response_data: JSON.stringify(responseData),
                    status: parseInt(responseStatus),
                    timestamp: new Date(startTime).toISOString(),
                    duration_ms: duration,
                    error: JSON.stringify(errorOccurred),
                    log_type: logType,
                    environment: process.env.APP_ENV,
                    log_id: uuidv4()
                };
                // Initiate logging without awaiting
                sendLogToFirehose(dataToSave)
            }

            // **Save the API call log**
            //await saveApiCall(dataToSave);
        }
    };
}
