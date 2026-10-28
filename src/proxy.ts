import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep the many internal planning, beta and status pages out of search. They
// remain available to the newsroom and do not affect public news coverage.
const internalRoute = /^\/(?:admin|account|api)(?:\/|$)/;
const workInProgressRoute = /^\/(?:[^/]+-status|beta(?:-|\/|$)|mock(?:-|\/|$)|launch(?:-|\/|$)|deployment(?:-|\/|$)|production(?:-|\/|$)|release(?:-|\/|$)|workflow(?:-|\/|$)|handoff(?:-|\/|$)|reader-ready(?:-|\/|$)|publish-sweep(?:-|\/|$)|security-hardening(?:-|\/|$)|stale-check(?:-|\/|$)|trim-status(?:-|\/|$))/;

export function proxy(request: NextRequest) {
  // A fresh nonce makes every route dynamic, which prevents Vercel's CDN from
  // caching public news pages. CSP is therefore supplied as a static header in
  // next.config.mjs; this proxy only handles route-specific robots directives.
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  if (internalRoute.test(path) || workInProgressRoute.test(path)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)", missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }] }],
};
