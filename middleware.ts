import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/dealer',
  '/agent',
  '/profile',
  '/wishlist',
  '/sell-used-tractor',
  '/compare',
];

// Define the routes that should not be accessed if the user is already authenticated
const authRoutes = ['/login', '/register', '/verify-otp'];

/**
 * Safely extracts user role from the accessToken JWT payload on the edge.
 */
function getRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded?.role?.toUpperCase() || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the access token from cookies
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;
  const userRole = isAuthenticated ? getRoleFromToken(token) : null;

  // Check if the current route is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 1. If the route is protected and the user is NOT authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Strict Role-Based Access Control (RBAC) on Protected Routes
  if (isAuthenticated && userRole) {
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const isDealer =
      userRole === 'DEALER' || userRole === 'DEALER_STAFF' || userRole === 'SELLER';
    const isAgent = userRole === 'AGENT';

    // A. Customer/Dealer/Agent attempting to access /admin routes
    if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !isAdmin) {
      if (isDealer) {
        return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
      }
      if (isAgent) {
        return NextResponse.redirect(new URL('/agent/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // B. Customer/Agent attempting to access /dealer routes
    if (
      (pathname === '/dealer' || pathname.startsWith('/dealer/')) &&
      !isDealer &&
      !isAdmin
    ) {
      if (isAgent) {
        return NextResponse.redirect(new URL('/agent/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // C. Customer/Dealer attempting to access /agent routes
    if (
      (pathname === '/agent' || pathname.startsWith('/agent/')) &&
      !isAgent &&
      !isAdmin
    ) {
      if (isDealer) {
        return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. If on an auth route and the user IS authenticated, redirect to role-specific dashboard
  if (isAuthRoute && isAuthenticated) {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (userRole === 'DEALER' || userRole === 'DEALER_STAFF' || userRole === 'SELLER') {
      return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
    }
    if (userRole === 'AGENT') {
      return NextResponse.redirect(new URL('/agent/dashboard', request.url));
    }
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
