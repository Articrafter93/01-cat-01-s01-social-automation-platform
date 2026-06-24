import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequiredRole } from "@/server/auth/policy";

// Auth.js session cookie names (dev and secure/prod variants).
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

/**
 * Coarse, Edge-safe gate: redirects clearly-unauthenticated requests away from
 * protected paths before they reach the server. It deliberately does NOT
 * decode or verify the session (that would require Node-only crypto in the Edge
 * bundle) and is NOT the security boundary — role verification and signature
 * checks happen in the Node-runtime guards (`requireApiRole`/`requirePageRole`).
 * A forged cookie passes here but is rejected by those guards.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!getRequiredRole(pathname, request.method)) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (hasSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/approvals",
    "/approvals/:path*",
    "/history",
    "/history/:path*",
    "/observability",
    "/observability/:path*",
    "/settings",
    "/settings/:path*",
    "/publications",
    "/publications/:path*",
    "/api/publications",
    "/api/publications/:path*",
    "/api/executions",
    "/api/executions/:path*",
    "/api/settings",
    "/api/settings/:path*",
  ],
};
