import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serve the tiny Unknown Roads collector from HGN's own origin. The upstream
// response sets a Cloudflare bot-management cookie; this response intentionally
// does not forward that header, so readers do not receive a third-party cookie.
export async function GET(request: NextRequest) {
  const upstream = new URL("https://unknownroads.com/a.js");
  const site = request.nextUrl.searchParams.get("site");
  if (site) upstream.searchParams.set("site", site);

  const response = await fetch(upstream, { next: { revalidate: 300 } });
  if (!response.ok) return new Response("Analytics script unavailable", { status: 502 });

  return new Response(await response.text(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
