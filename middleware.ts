import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

// Protected user routes that require authentication
const PROTECTED_USER_ROUTES = [
  '/dashboard',
  '/wallet',
  '/portfolio',
  '/investments',
  '/market-watchlist',
  '/account',
  '/kyc',
  '/support',
  '/deposit',
  '/withdraw',
  '/checkout-history',
];

// Protected admin routes
const PROTECTED_ADMIN_ROUTES = ['/admin'];

// Public auth routes
const PUBLIC_AUTH_ROUTES = ['/auth', '/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  const adminToken = request.cookies.get('admin_session')?.value;

  // Check if route is a protected user route
  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is a protected admin route
  const isProtectedAdminRoute = PROTECTED_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is a public auth route
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Verify user token if needed
  let userValid = false;
  if (authToken) {
    try {
      await jwtVerify(authToken, JWT_SECRET);
      userValid = true;
    } catch (error) {
      console.error('[v0] Token verification failed:', error);
    }
  }

  // Verify admin token if needed
  let adminValid = false;
  if (adminToken) {
    try {
      await jwtVerify(adminToken, JWT_SECRET);
      adminValid = true;
    } catch (error) {
      console.error('[v0] Admin token verification failed:', error);
    }
  }

  // Protect user dashboard routes
  if (isProtectedUserRoute) {
    if (!userValid) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isProtectedAdminRoute) {
    if (!adminValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isPublicAuthRoute) {
    if (userValid && pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (adminValid && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes we want to allow
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
