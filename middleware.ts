import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Check for Supabase Auth cookie session token
  const hasSession = req.cookies.get("sb-access-token") || req.cookies.getAll().some(c => c.name.includes("-auth-token"));

  // If trying to access portal routes without a session, redirect to login
  if (req.nextUrl.pathname.startsWith("/portal") && req.nextUrl.pathname !== "/portal/login") {
    if (!hasSession) {
      // Allow bypass for local testing if preferred, or enforce strict login:
      // Uncomment the line below to enforce strict redirection:
      // return NextResponse.redirect(new URL("/portal/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/portal/:path*"],
};