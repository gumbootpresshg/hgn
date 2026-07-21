import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const allowed = new Set(["admin","administrator","publisher","editor","newsroom","super_admin","superadmin"]);

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server settings are incomplete.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function requirePublisher(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false as const, status: 500, error: "Supabase server settings are incomplete." };
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { ok: false as const, status: 401, error: "Login required." };
  const userRes = await fetch(`${url.replace(/\/$/,"")}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` }, cache: "no-store" });
  const user = await userRes.json().catch(() => null);
  if (!userRes.ok || !user?.id) return { ok: false as const, status: 401, error: "Your session could not be verified." };
  const db = serviceClient();
  const { data } = await db.from("hgn_profiles").select("account_type,is_admin,can_access_publisher_tools,admin_role").eq("user_id", user.id).limit(10);
  const ok = (data || []).some((x:any) => x.is_admin === true || x.can_access_publisher_tools === true || allowed.has(String(x.account_type || "").toLowerCase()) || allowed.has(String(x.admin_role || "").toLowerCase()));
  if (!ok) return { ok: false as const, status: 403, error: "Publisher access required." };
  return { ok: true as const, user, db };
}

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c] || c));
}

export function normalizeInterest(value: string) {
  const v = value.toLowerCase();
  if (v.includes("breaking")) return "breaking";
  if (v.includes("event")) return "events";
  if (v.includes("weather") || v.includes("ferry") || v.includes("marine")) return "weather_ferry";
  if (v.includes("classified") || v.includes("marketplace")) return "marketplace";
  if (v.includes("opinion")) return "opinion";
  if (v.includes("obituar")) return "obituaries";
  if (v.includes("sport")) return "sports";
  if (v.includes("guide")) return "guide";
  return "news";
}

export function articleTopic(article: any) {
  const c = `${article.category || ""} ${article.subcategory || ""}`.toLowerCase();
  if (c.includes("opinion") || c.includes("column") || c.includes("letter")) return "opinion";
  if (c.includes("obituar")) return "obituaries";
  if (c.includes("sport")) return "sports";
  if (c.includes("weather") || c.includes("ferry") || c.includes("marine")) return "weather_ferry";
  if (c.includes("market") || c.includes("classified")) return "marketplace";
  if (c.includes("guide") || c.includes("travel")) return "guide";
  return "news";
}

export function renderNewsletterHtml(opts: { edition:any; subscriber:any; siteUrl:string; logoUrl:string }) {
  const { edition, subscriber, siteUrl, logoUrl } = opts;
  const content = edition.content_json || {};
  const interests = new Set((subscriber.interests || []).map((x:string)=>normalizeInterest(x)));
  const everything = !interests.size || interests.has("news");
  const articles = (content.articles || []).filter((a:any) => everything || interests.has(a.topic));
  const eventItems = (everything || interests.has("events")) ? (content.events || []) : [];
  const pref = `${siteUrl}/newsletter/preferences/${subscriber.preference_token}`;
  const cards = articles.map((a:any) => `<tr><td style="padding:18px 0;border-top:1px solid #ddd"><div style="font:700 12px Arial;color:#155b89;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(a.category || "News")}</div><h2 style="margin:6px 0 8px;font:700 25px Georgia;color:#111"><a href="${escapeHtml(siteUrl + '/articles/' + a.slug)}" style="color:#111;text-decoration:none">${escapeHtml(a.title)}</a></h2><p style="margin:0;font:16px/1.5 Arial;color:#444">${escapeHtml(a.excerpt || "Read the full story on Haida Gwaii News.")}</p></td></tr>`).join("");
  const formatEventDate = (value: unknown) => {
    if (!value) return "";
    const date = new Date(`${String(value)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "America/Vancouver" });
  };
  const eventRows = Array.from(new Map(eventItems.map((event:any) => [`${String(event.title || "").trim().toLowerCase()}|${event.start_date || ""}`, event])).values());
  const events = eventRows.length ? `<tr><td style="padding:20px 0;border-top:2px solid #111"><h2 style="font:700 24px Georgia;margin:0 0 10px">Coming up</h2>${eventRows.map((e:any)=>{
    const when = [formatEventDate(e.start_date), e.is_all_day ? "All day" : e.start_time, !e.is_all_day && e.end_time ? `to ${e.end_time}` : ""].filter(Boolean).join(" · ");
    const where = [e.location, e.community].filter(Boolean).join(" · ");
    const details = escapeHtml(e.description || "View event details and updates on Haida Gwaii News.");
    return `<div style="margin:14px 0;padding:14px 0;border-top:1px solid #ddd"><h3 style="font:700 19px Georgia;margin:0 0 5px"><a href="${escapeHtml(siteUrl + '/events')}" style="color:#111;text-decoration:none">${escapeHtml(e.title)}</a></h3>${when ? `<p style="font:700 14px/1.5 Arial;margin:0 0 3px;color:#333">${escapeHtml(when)}</p>` : ""}${where ? `<p style="font:14px/1.5 Arial;margin:0 0 6px;color:#555">${escapeHtml(where)}</p>` : ""}<p style="font:15px/1.5 Arial;margin:0;color:#444">${details}</p><p style="font:700 13px Arial;margin:7px 0 0"><a href="${escapeHtml(siteUrl + '/events')}" style="color:#155b89">View event details</a></p></div>`;
  }).join("")}</td></tr>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f3ee"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 10px"><table role="presentation" width="100%" style="max-width:680px;background:#fff;border:1px solid #ddd;padding:28px"><tr><td align="center"><img src="${escapeHtml(logoUrl)}" alt="Haida Gwaii News" width="150" style="display:block;max-width:150px;height:auto"><h1 style="font:700 34px Georgia;margin:14px 0 4px">${escapeHtml(edition.title)}</h1><p style="font:14px Arial;color:#666;margin:0 0 22px">News from the edge</p></td></tr><tr><td><p style="font:17px/1.6 Georgia;color:#222">${escapeHtml(edition.intro || "Here is your latest Haida Gwaii News update.")}</p></td></tr>${cards || '<tr><td><p style="font:16px Arial">No new stories matched your selected topics in this edition.</p></td></tr>'}${events}<tr><td style="padding-top:26px;border-top:1px solid #ddd"><p style="font:13px/1.5 Arial;color:#666">You received this because you subscribed to Haida Gwaii News. <a href="${escapeHtml(pref)}">Manage preferences or unsubscribe</a>.</p><p style="font:13px Arial;color:#666"><a href="${escapeHtml(siteUrl)}">haidagwaiinews.com</a></p></td></tr></table></td></tr></table></body></html>`;
}
