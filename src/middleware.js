import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Convert the secret key to a Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
    const { cookies, nextUrl } = req;
    const token = cookies.get('authToken')?.value;

    // Check if the user is accessing the /login page
    if (nextUrl.pathname === '/login') {
        // If token exists and is valid, redirect to the homepage
        if (token) {
            try {
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL('/', nextUrl.origin));
            } catch (error) {
                console.error('Invalid or expired token:', error);
            }
        }
        // Allow access to /login if no valid token exists
        return NextResponse.next();
    }

    // Allow access to /api/user/login route without authentication
    if (nextUrl.pathname === '/api/user/login') {
        return NextResponse.next();
    }

    // For other routes, check for authentication
    if (!token) {
        return NextResponse.redirect(new URL('/login', nextUrl.origin));
    }

    try {
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (error) {
        console.error('Invalid or expired token:', error);
        return NextResponse.redirect(new URL('/login', nextUrl.origin));
    }
}

// Middleware configuration for pages and API routes (excluding specific paths)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/user/login).*)',
        '/api/:path*',
    ],
};
