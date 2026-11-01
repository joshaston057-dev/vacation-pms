import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for Supabase session cookie or auth token
  const authCookie = request.cookies.get('sb-access-token')?.value || 
                     request.cookies.get('sb-refresh-token')?.value ||
                     request.cookies.getAll().find(c => c.name.includes('auth-token'))?.value

  const isOperationsPage = request.nextUrl.pathname.startsWith('/operations')

  // If trying to access operations without being logged in, redirect to login
  if (isOperationsPage && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/operations/:path*'],
}