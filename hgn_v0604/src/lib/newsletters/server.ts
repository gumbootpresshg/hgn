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

function absoluteUrl(siteUrl: string, value: unknown) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

function formatEventDate(value: unknown) {
  if (!value) return "";
  const date = new Date(`${String(value)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Vancouver" });
}

export function renderNewsletterHtml(opts: { edition:any; subscriber:any; siteUrl:string; logoUrl:string }) {
  const { edition, subscriber, siteUrl, logoUrl } = opts;
  const content = edition.content_json || {};
  const interests = new Set((subscriber.interests || []).map((x:string)=>normalizeInterest(x)));
  const everything = !interests.size || interests.has("news");
  const articles = (content.articles || []).filter((a:any) => everything || interests.has(a.topic));
  const eventItems = (everything || interests.has("events")) ? (content.events || []) : [];
  const pref = `${siteUrl}/newsletter/preferences/${subscriber.preference_token}`;
  const hero = articles[0];
  const more = articles.slice(1, 7);
  const issueDate = new Date(edition.date_to || edition.published_at || edition.created_at || Date.now()).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Vancouver" });

  const heroHtml = hero ? `
    <tr><td style="padding:0 24px 22px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-bottom:1px solid #b8b0a3">
        ${hero.image_url ? `<tr><td><a href="${escapeHtml(siteUrl + '/articles/' + hero.slug)}"><img src="${escapeHtml(absoluteUrl(siteUrl, hero.image_url))}" alt="${escapeHtml(hero.title)}" width="672" style="display:block;width:100%;max-width:672px;height:auto;border:0"></a></td></tr>` : ""}
        <tr><td style="padding:18px 0 22px">
          <div style="font:700 11px Arial,sans-serif;color:#1e5f94;text-transform:uppercase;letter-spacing:.15em">Lead story</div>
          <h2 style="margin:6px 0 9px;font:700 34px/1.08 Georgia,'Times New Roman',serif;color:#101820"><a href="${escapeHtml(siteUrl + '/articles/' + hero.slug)}" style="color:#101820;text-decoration:none">${escapeHtml(hero.title)}</a></h2>
          <p style="margin:0 0 14px;font:17px/1.5 Georgia,'Times New Roman',serif;color:#3b3b3b">${escapeHtml(hero.excerpt || "Read the full story on Haida Gwaii News.")}</p>
          <a href="${escapeHtml(siteUrl + '/articles/' + hero.slug)}" style="font:700 12px Arial,sans-serif;color:#1e5f94;text-transform:uppercase;letter-spacing:.08em;text-decoration:none">Read the full story →</a>
        </td></tr>
      </table>
    </td></tr>` : `<tr><td style="padding:24px;font:16px Arial,sans-serif">No new stories matched your selected topics in this edition.</td></tr>`;

  const storyRows = more.length ? `
    <tr><td style="padding:0 24px 24px">
      <div style="border-top:3px solid #101820;padding-top:9px;margin-bottom:12px;font:700 13px Arial,sans-serif;color:#101820;text-transform:uppercase;letter-spacing:.12em">More stories from the edge</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        ${more.map((a:any, index:number) => `
          <tr>
            <td width="${a.image_url ? "31%" : "0"}" valign="top" style="padding:${index ? "16px" : "0"} 14px 16px 0;border-bottom:1px solid #d8d2c8">
              ${a.image_url ? `<a href="${escapeHtml(siteUrl + '/articles/' + a.slug)}"><img src="${escapeHtml(absoluteUrl(siteUrl, a.image_url))}" alt="" width="190" style="display:block;width:100%;max-width:190px;height:auto;border:0"></a>` : ""}
            </td>
            <td valign="top" style="padding:${index ? "16px" : "0"} 0 16px;border-bottom:1px solid #d8d2c8">
              <div style="font:700 10px Arial,sans-serif;color:#1e5f94;text-transform:uppercase;letter-spacing:.12em">${escapeHtml(a.category || "News")}</div>
              <h3 style="margin:5px 0 6px;font:700 21px/1.15 Georgia,'Times New Roman',serif"><a href="${escapeHtml(siteUrl + '/articles/' + a.slug)}" style="color:#101820;text-decoration:none">${escapeHtml(a.title)}</a></h3>
              <p style="margin:0 0 8px;font:14px/1.45 Arial,sans-serif;color:#4b4b4b">${escapeHtml(a.excerpt || "Read the full story on Haida Gwaii News.")}</p>
              <a href="${escapeHtml(siteUrl + '/articles/' + a.slug)}" style="font:700 11px Arial,sans-serif;color:#1e5f94;text-decoration:none">READ MORE →</a>
            </td>
          </tr>`).join("")}
      </table>
    </td></tr>` : "";

  const eventRows = Array.from(new Map(eventItems.map((event:any) => [`${String(event.title || "").trim().toLowerCase()}|${event.start_date || ""}`, event])).values()).slice(0, 6);
  const eventsHtml = eventRows.length ? `
    <tr><td style="padding:0 24px 24px">
      <div style="border-top:3px solid #101820;padding-top:9px;margin-bottom:12px;font:700 13px Arial,sans-serif;color:#101820;text-transform:uppercase;letter-spacing:.12em">Coming up</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        ${eventRows.map((e:any) => {
          const when = [formatEventDate(e.start_date), e.is_all_day ? "All day" : e.start_time, !e.is_all_day && e.end_time ? `to ${e.end_time}` : ""].filter(Boolean).join(" · ");
          const where = [e.location, e.community].filter(Boolean).join(" · ");
          return `<tr>
            <td width="92" valign="top" style="padding:12px 12px 12px 0;border-bottom:1px solid #d8d2c8;font:700 14px Georgia,'Times New Roman',serif;color:#1e5f94">${escapeHtml(formatEventDate(e.start_date))}</td>
            <td valign="top" style="padding:12px 0;border-bottom:1px solid #d8d2c8">
              <h3 style="margin:0 0 4px;font:700 18px Georgia,'Times New Roman',serif;color:#101820">${escapeHtml(e.title)}</h3>
              ${when ? `<p style="margin:0 0 3px;font:700 13px Arial,sans-serif;color:#333">${escapeHtml(when)}</p>` : ""}
              ${where ? `<p style="margin:0 0 5px;font:13px Arial,sans-serif;color:#666">${escapeHtml(where)}</p>` : ""}
              <p style="margin:0;font:14px/1.45 Arial,sans-serif;color:#4b4b4b">${escapeHtml(e.description || "See the full event listing for details and updates.")}</p>
            </td>
          </tr>`;
        }).join("")}
      </table>
      <p style="margin:12px 0 0"><a href="${escapeHtml(siteUrl + '/events')}" style="font:700 11px Arial,sans-serif;color:#1e5f94;text-decoration:none">VIEW ALL EVENTS →</a></p>
    </td></tr>` : "";

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><style>@media only screen and (max-width:640px){.page{width:100%!important}.masthead{font-size:36px!important}.pad{padding-left:16px!important;padding-right:16px!important}}</style></head>
<body style="margin:0;background:#ece9e2;color:#101820">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ece9e2"><tr><td align="center" style="padding:20px 8px">
<table role="presentation" width="720" class="page" cellspacing="0" cellpadding="0" style="width:720px;max-width:720px;background:#fffdf8;border:1px solid #cfc8bb;border-collapse:collapse">
  <tr><td class="pad" style="padding:14px 24px 8px;border-bottom:1px solid #101820">
    <table role="presentation" width="100%"><tr><td style="font:italic 12px Georgia,'Times New Roman',serif;color:#333">Your independent voice for Haida Gwaii</td><td align="right" style="font:12px Arial,sans-serif;color:#333">${escapeHtml(issueDate)} &nbsp; | &nbsp; Newsletter Edition</td></tr></table>
  </td></tr>
  <tr><td align="center" class="pad" style="padding:22px 24px 16px;border-bottom:4px double #101820">
    <div class="masthead" style="font:700 55px/1 Georgia,'Times New Roman',serif;letter-spacing:.01em;color:#10243b;text-transform:uppercase">Haida Gwaii News</div>
    <div style="margin-top:9px;font:700 13px Arial,sans-serif;color:#1e5f94;letter-spacing:.34em;text-transform:uppercase">News From the Edge</div>
  </td></tr>
  <tr><td class="pad" style="padding:15px 24px 18px"><p style="margin:0;font:16px/1.55 Georgia,'Times New Roman',serif;color:#333">${escapeHtml(edition.intro || "Here is your latest Haida Gwaii News update.")}</p></td></tr>
  ${heroHtml}
  ${storyRows}
  ${eventsHtml}
  <tr><td class="pad" style="padding:18px 24px;background:#f4f0e8;border-top:3px solid #101820">
    <table role="presentation" width="100%"><tr>
      <td width="84" valign="top"><img src="${escapeHtml(logoUrl)}" alt="Haida Gwaii News" width="68" style="display:block;width:68px;height:auto"></td>
      <td valign="top" style="font:12px/1.5 Arial,sans-serif;color:#555"><strong style="color:#101820">Haida Gwaii News</strong><br>Independent local reporting for our islands.<br><a href="${escapeHtml(siteUrl)}" style="color:#1e5f94">haidagwaiinews.com</a></td>
      <td valign="top" align="right" style="font:12px/1.5 Arial,sans-serif;color:#555">You received this because you subscribed.<br><a href="${escapeHtml(pref)}" style="color:#1e5f94">Manage preferences or unsubscribe</a></td>
    </tr></table>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}
