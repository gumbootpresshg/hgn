import { NextRequest } from "next/server";

export const runtime = "nodejs";

// First-party relay for the analytics collector. Do not forward visitor cookies
// or upstream response headers (especially Set-Cookie).
export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await fetch("https://unknownroads.com/api/collect", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
    cache: "no-store",
  });
  return new Response(null, { status: response.ok ? 204 : 502, headers: { "Cache-Control": "no-store" } });
}
