import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// convert the secret key to a Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
    const { cookies, nextUrl } = req;
    const token = cookies.get('authToken')?.value;

    // allow access to /login page and /api/user/login route without authentication
    if (nextUrl.pathname === '/login' || nextUrl.pathname === '/api/user/login') {
        return NextResponse.next();
    }

    // check on any other url/route
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

// middleware to pages and API routes (excluding /api/user/login)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|login|api/user/login).*)',
        '/api/:path*',
    ],
};
