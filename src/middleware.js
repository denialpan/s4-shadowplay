import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
    const { cookies, nextUrl } = req;
    const token = cookies.get('authToken')?.value;

    const response = NextResponse.next();

    // logged in and trying to reach /login
    if (nextUrl.pathname === '/login') {
        if (token) {
            try {
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL('/', nextUrl.origin));
            } catch (error) {
                console.error('Invalid or expired token:', error);
            }
        }
        return NextResponse.next();
    }

    // unrestrict login api route
    if (nextUrl.pathname === '/api/user/login') {
        return NextResponse.next();
    }

    // if no token at all
    if (!token) {
        return NextResponse.redirect(new URL('/login', nextUrl.origin));
    }

    // all other routes need auth
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
