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

    if (user && user.vendorId) {
        // 3. User is authenticated
        // fetch the vendor from db and check it has status of active..
        const vendor = await getVendorById(user.vendorId)
        if (vendor && vendor?.data?.status === 'Active') {
            user.role ='vendor'
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
            console.log(user)
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