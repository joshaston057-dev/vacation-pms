import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Check for Supabase auth cookies
  const token = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token');

  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // 1. If trying to access admin pages without being logged in, redirect to login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. If already logged in and visiting the login page, redirect straight to admin bookings
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/admin/bookings', req.url));
  }

  return res;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/login'],
};