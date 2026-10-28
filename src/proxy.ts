import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep the many internal planning, beta and status pages out of search. They
// remain available to the newsroom and do not affect public news coverage.
const internalRoute = /^\/(?:admin|account|api)(?:\/|$)/;
const workInProgressRoute = /^\/(?:[^/]+-status|beta(?:-|\/|$)|mock(?:-|\/|$)|launch(?:-|\/|$)|deployment(?:-|\/|$)|production(?:-|\/|$)|release(?:-|\/|$)|workflow(?:-|\/|$)|handoff(?:-|\/|$)|reader-ready(?:-|\/|$)|publish-sweep(?:-|\/|$)|security-hardening(?:-|\/|$)|stale-check(?:-|\/|$)|trim-status(?:-|\/|$))/;

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.supabase.co`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://earthquake.usgs.gov https://weather.gc.ca",
    "frame-src 'self' https:",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  const path = request.nextUrl.pathname;
  if (internalRoute.test(path) || workInProgressRoute.test(path)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)", missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }] }],
};
