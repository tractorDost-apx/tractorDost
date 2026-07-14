import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/dealer', '/agent', '/profile', '/wishlist', '/sell-used-tractor'];

// Define the routes that should not be accessed if the user is already authenticated
const authRoutes = ['/login', '/register', '/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the access token from cookies
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;

  // Check if the current route is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If the route is protected and the user is NOT authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Optional: add a callback URL so they return to the page they tried to access
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // If the route is an auth route and the user IS authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is on the root home page (/) and IS authenticated, redirect to dashboard
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed for public routes or authorized protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
