import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/newsletters/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const placement = String(url.searchParams.get("placement") || "").trim().slice(0, 120) || null;
  const source = String(url.searchParams.get("source") || "display").trim().slice(0, 80) || "display";
  const to = url.searchParams.get("to") || "/advertise";
  let destination: URL;
  try { destination = to.startsWith("http") ? new URL(to) : new URL(to, url.origin); }
  catch { destination = new URL("/advertise", url.origin); }
  if (!["http:", "https:"].includes(destination.protocol)) destination = new URL("/advertise", url.origin);
  if (id) {
    try {
      const db = serviceClient();
      const referringPage = (() => {
        try { return new URL(req.headers.get("referer") || "", url.origin).pathname; }
        catch { return "/"; }
      })();
      await Promise.allSettled([
        db.from("ad_click_events").insert({ ad_id: id }),
        db.from("hgn_public_analytics_events").insert({ event_type: "ad_click", page_path: referringPage, ad_id: id, placement_key: placement, source }),
      ]);
    } catch {
      // Advertising clicks must still reach the destination if analytics is unavailable.
    }
  }
  return NextResponse.redirect(destination);
}
