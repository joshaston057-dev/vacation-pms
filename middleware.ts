import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all access directly to /operations without redirect loops
  return NextResponse.next()
}

export const config = {
  matcher: [],
}