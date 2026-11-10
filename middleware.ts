import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define routes that require authentication
  const isProtectedRoute = 
    path.startsWith('/properties') ||
    path.startsWith('/bookings') ||
    path.startsWith('/financials') ||
    path.startsWith('/co-hosting') ||
    path.startsWith('/upsells') ||
    path.startsWith('/tasks')

  // Check for auth token cookie (Replace 'auth-token' with your actual Supabase cookie or session token name)
  const authToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('auth-token')?.value

  // If trying to access a protected dashboard route without a session, redirect to login
  if (isProtectedRoute && !authToken) {
    // For local development testing if you want to bypass login temporarily, 
    // you can comment out the return statement below.
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/properties/:path*',
    '/bookings/:path*',
    '/financials/:path*',
    '/co-hosting/:path*',
    '/upsells/:path*',
    '/tasks/:path*',
  ],
}