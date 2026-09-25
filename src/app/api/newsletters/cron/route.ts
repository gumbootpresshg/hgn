import { NextRequest, NextResponse } from "next/server"
import { articleTopic, renderNewsletterHtml, serviceClient } from "@/lib/newsletters/server"

export const runtime = "nodejs"
export const maxDuration = 60

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  return !secret || req.headers.get("authorization") === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const db = serviceClient()
  const { data: settings } = await db.from("hgn_newsletter_settings").select("*").eq("singleton_key", "default").single()
  if (!settings || settings.mode !== "automatic") return NextResponse.json({ skipped: true, reason: "Automatic newsletters are off." })

  const now = new Date()
  const lastBuilt = settings.last_built_at ? new Date(settings.last_built_at) : null
  if (lastBuilt && now.getTime() - lastBuilt.getTime() < Number(settings.frequency_days || 14) * 86400000) return NextResponse.json({ skipped: true, reason: "Not due yet." })
  const from = new Date(now.getTime() - Number(settings.lookback_days || 14) * 86400000)

  const { data: articles } = await db.from("articles").select("id,title,slug,excerpt,dek,category,subcategory,image_url,published_at,featured,front_page_main").eq("status", "published").gte("published_at", from.toISOString()).order("front_page_main", { ascending: false }).order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(Number(settings.max_stories || 12))
  const filteredArticles = (articles || []).filter((article: any) => {
    const topic = articleTopic(article)
    if (topic === "opinion" && !settings.include_opinion) return false
    if (topic === "obituaries" && !settings.include_obituaries) return false
    if (topic === "marketplace" && !settings.include_marketplace) return false
    if (topic === "guide" && !settings.include_guide) return false
    if (topic === "weather_ferry" && !(settings.include_weather || settings.include_ferry)) return false
    return true
  }).map((article: any) => ({ ...article, topic: articleTopic(article), excerpt: article.excerpt || article.dek || "" }))

  let events: any[] = []
  if (settings.include_events) {
    // Staff drafts must never enter an automatic newsletter build.
    const result = await db.from("events").select("id,title,description,start_date,start_time,end_time,is_all_day,location,community").in("status", ["published", "approved", "public", "live", "active"]).gte("start_date", now.toISOString().slice(0, 10)).order("start_date", { ascending: true }).limit(8)
    const seen = new Set<string>()
    events = (result.data || []).filter((event: any) => {
      const key = `${String(event.title || "").trim().toLowerCase()}|${event.start_date || ""}`
      if (!event.title || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const title = `Haida Gwaii News · ${now.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Vancouver" })}`
  const { count } = await db.from("subscribers").select("id", { head: true, count: "exact" }).eq("status", "active").eq("frequency", "biweekly")
  const { data: edition, error } = await db.from("newsletter_editions").insert({ title, slug: `newsletter-${now.toISOString().slice(0, 10)}-${Date.now().toString().slice(-5)}`, subject_line: title, status: settings.automatic_action === "build_and_send" && !settings.require_approval ? "scheduled" : "review", edition_type: "biweekly", audience_segment: "preference_groups", intro: "Here is your latest Haida Gwaii News digest, compiled from the stories and community updates published since our last edition.", date_from: from.toISOString().slice(0, 10), date_to: now.toISOString().slice(0, 10), content_json: { articles: filteredArticles, events }, recipient_count: count || 0, build_source: "automatic" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from("hgn_newsletter_settings").update({ last_built_at: now.toISOString(), updated_at: now.toISOString() }).eq("singleton_key", "default")
  if (settings.automatic_action !== "build_and_send" || settings.require_approval) return NextResponse.json({ built: true, edition_id: edition.id, sent: false })

  const api = process.env.RESEND_API_KEY
  if (!api) return NextResponse.json({ built: true, edition_id: edition.id, sent: false, error: "RESEND_API_KEY missing" })
  const { data: subscribers } = await db.from("subscribers").select("id,email,name,interests,preference_token").eq("status", "active").eq("frequency", "biweekly").limit(1000)
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com"
  let sent = 0
  let failed = 0
  for (let index = 0; index < (subscribers || []).length; index += 100) {
    const chunk = (subscribers || []).slice(index, index + 100)
    const payload = chunk.map((subscriber: any) => ({ from: `${settings.from_name} <${settings.from_email}>`, to: [subscriber.email], reply_to: settings.reply_to || undefined, subject: edition.subject_line || edition.title, html: renderNewsletterHtml({ edition, subscriber, siteUrl: site, logoUrl: `${site}/brand/hgn-news-seal.png` }) }))
    const response = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${api}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (response.ok) sent += chunk.length
    else failed += chunk.length
  }
  await db.from("newsletter_editions").update({ status: "sent", sent_at: now.toISOString(), published_at: now.toISOString(), delivered_count: sent, failed_count: failed }).eq("id", edition.id)
  await db.from("hgn_newsletter_settings").update({ last_sent_at: now.toISOString() }).eq("singleton_key", "default")
  return NextResponse.json({ built: true, edition_id: edition.id, sent: true, delivered: sent, failed })
}
