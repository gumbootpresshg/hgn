export const dynamic = "force-dynamic";
export async function GET() {
  const key = String(process.env.INDEXNOW_KEY || "").trim();
  if (!key) return new Response("Not configured", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
