import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  // Parse user data from cookie
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }

  // Public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || path === '/auth/register' || path === '/';

  // Redirect logged-in users away from auth pages
  if (isPublicPath && token && user) {
    if (user.role === 'MAIN_ADMIN' || user.role === 'GENERAL_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (user.role === 'USER') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    } else if (user.role === 'MERCHANT') {
      return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
    }
  }

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (user.role !== 'MAIN_ADMIN' && user.role !== 'GENERAL_ADMIN') {
      // Redirect non-admin users to their appropriate dashboard
      if (user.role === 'USER') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      } else if (user.role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Protect user routes
  if (path.startsWith('/user')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Users can only access user dashboard
    if (user.role !== 'USER') {
      if (user.role === 'MAIN_ADMIN' || user.role === 'GENERAL_ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (user.role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
      }
    }
  }

  // Protect merchant routes
  if (path.startsWith('/merchant')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (user.role !== 'MERCHANT') {
      if (user.role === 'MAIN_ADMIN' || user.role === 'GENERAL_ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (user.role === 'USER') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/merchant/:path*',
    '/auth/login',
    '/auth/register',
    '/',
  ],
};
