import { NextResponse } from "next/server";

export function middleware(request: Request) {
    const url = new URL(request.url);

    // Check if the request is for admin routes
    if (url.pathname.startsWith("/admin")) {
        const token = request.headers.get("Cookie")?.includes("authToken");

        // Redirect unauthenticated users to the login page
        if (!token) {
            return NextResponse.redirect(new URL("/admin/auth/login", url.origin));
        }
    }

    return NextResponse.next(); // Allow the request to proceed if authenticated
}

export const config = {
    matcher: ["/admin/:path*"], // Apply middleware to all admin routes
};
