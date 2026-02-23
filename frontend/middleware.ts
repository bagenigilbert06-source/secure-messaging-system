import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for authentication and route protection
 * Runs on every request to protected routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
  ];

  // Routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/my-items', '/claims'];

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    route => route === pathname || pathname.startsWith(route)
  );

  // Check if user is authenticated
  const hasRefreshToken = request.cookies.has('auth_refresh_token');
  const hasTokenFlag = request.cookies.has('auth_token_exists');
  const isAuthenticated = hasRefreshToken && hasTokenFlag;

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue to next middleware/handler
  return NextResponse.next();
}

/**
 * Configure which routes should be handled by middleware
 */
export const config = {
  matcher: [
    // Match all routes except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
