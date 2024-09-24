import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const secret = process.env.NEXTAUTH_SECRET;  // Get the secret from environment variables
  const token = await getToken({ req, secret });  // Pass the secret to getToken

  const { pathname } = req.nextUrl;

  // Allow access to the homepage for everyone
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Admin-only routes: both pages and API
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin')) {
    if (token.role !== 'admin') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ message: 'Access denied: Admins only' }, { status: 403 });
      } else {
        return NextResponse.redirect(new URL('/403', req.url)); // Redirect to a 403 page
      }
    }
  }

  // Vendor-only routes: both pages and API
  if (pathname.startsWith('/vendor') || pathname.startsWith('/api/v1/vendor')) {
    if (token.role !== 'vendor') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ message: 'Access denied: Vendors only' }, { status: 403 });
      } else {
        return NextResponse.redirect(new URL('/403', req.url)); // Redirect to a 403 page
      }
    }
  }

  // Allow the request to continue for authorized users
  return NextResponse.next();
}

// Configure the matcher to apply this middleware to all admin/vendor pages and APIs
export const config = {
  matcher: [
    '/admin/:path*',             // Protect all admin pages
    '/vendor/:path*',            // Protect all vendor pages
    '/api/v1/admin/:path*',       // Protect all admin API routes
    '/api/v1/vendor/:path*',      // Protect all vendor API routes
    '/'                          // Allow access to homepage
  ],
};
