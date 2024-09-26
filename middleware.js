import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname, origin } = req.nextUrl;

    // Get the authenticated user and their role
    const user = req.auth?.user;

    // Unauthenticated user accessing protected routes
    if (!user && pathname !== "/login" && pathname !== "/") {
        const loginUrl = new URL("/login", origin);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only access control
    if (pathname.startsWith("/admin")) {
        // If a non-admin (e.g., vendor) tries to access admin routes
        if (user?.role !== "admin") {
            // Redirect to their respective dashboard
            const redirectUrl = user?.role === "vendor"
                ? `/vendor/${user.vendor}/dashboard`
                : "/login";
            return NextResponse.redirect(new URL(redirectUrl, origin));
        }
    }

    // Vendor-only access control
    if (pathname.startsWith("/vendor")) {
        // If a non-vendor (e.g., admin) tries to access vendor routes
        if (user?.role !== "vendor") {
            // Redirect to their respective dashboard
            const redirectUrl = user?.role === "admin"
                ? "/admin/dashboard"
                : "/login";
            return NextResponse.redirect(new URL(redirectUrl, origin));
        }
    }

    // Redirect authenticated users trying to access /login to their appropriate dashboard
    if (user && pathname === "/login") {
        if (user.role === "admin") {
            const adminUrl = new URL("/admin/dashboard", origin);
            return NextResponse.redirect(adminUrl);
        } else if (user.role === "vendor" && user.vendor) {
            const vendorUrl = new URL(`/vendor/${user.vendor}/dashboard`, origin);
            return NextResponse.redirect(vendorUrl);
        }
    }

    // Allow access to homepage and all other unprotected routes
    return NextResponse.next();
});

// Define which routes the middleware applies to
export const config = {
    matcher: [
        "/admin/:path*",  // Protect all admin routes
        "/vendor/:path*", // Protect all vendor routes
        "/",              // Allow access to homepage
        "/login",         // Allow access to login page
    ],
};
