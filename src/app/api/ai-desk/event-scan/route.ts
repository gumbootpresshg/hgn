import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const allowed = new Set(["admin", "publisher", "editor"])
const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
const EVENT_WORDS = /\b(event|festival|fair|meeting|workshop|concert|market|fundraiser|tournament|game|race|screening|show|dance|dinner|lunch|breakfast|open house|celebration|ceremony|registration|class|session|presentation|talk|lecture|gathering|sale)\b/i
const NOISE_WORDS = /\b(home|about|contact|privacy|menu|search|login|sign in|facebook|instagram|copyright|subscribe|newsletter|navigation|read more|learn more|click here|calendar view)\b/i

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.")
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "")
  if (!token) throw new Error("Login required.")
  const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
  const { data: { user } } = await auth.auth.getUser(token)
  if (!user) throw new Error("Session could not be verified.")
  const { data: profiles } = await auth.from("hgn_profiles").select("account_type,admin_role,is_admin,can_access_publisher_tools").eq("user_id", user.id)
  if (!(profiles || []).some((x: any) => x.is_admin || x.can_access_publisher_tools || allowed.has(String(x.account_type || "").toLowerCase()) || allowed.has(String(x.admin_role || "").toLowerCase()))) {
    throw new Error("Publisher or editor access required.")
  }
  return { db: createClient(url, service, { auth: { persistSession: false } }), user }
}

function cleanText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function parseDate(raw: string, yearHint: number) {
  const hasYear = /20\d{2}/.test(raw)
  const value = hasYear ? raw : `${raw}, ${yearHint}`
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function similarity(a: string, b: string) {
  const A = new Set(normalizeTitle(a).split(" ").filter((x) => x.length > 2))
  const B = new Set(normalizeTitle(b).split(" ").filter((x) => x.length > 2))
  if (!A.size || !B.size) return 0
  let intersection = 0
  for (const token of A) if (B.has(token)) intersection++
  return intersection / Math.max(A.size, B.size)
}


function absoluteDuckUrl(value: string) {
  try {
    const decoded = decodeURIComponent(value)
    const match = decoded.match(/[?&]uddg=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : decoded
  } catch { return value }
}

function discoveryCandidates(html: string) {
  const out: { name: string; url: string }[] = []
  const re = /<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) && out.length < 20) {
    const url = absoluteDuckUrl(m[1]).replace(/&amp;/g, "&")
    const name = cleanText(m[2]).slice(0, 140)
    if (!/^https?:\/\//i.test(url) || !name) continue
    out.push({ name, url })
  }
  return out
}

function buildCandidates(body: string, start: string, end: string, source: any) {
  const plain = cleanText(body)
  const yearHint = Number(start.slice(0, 4)) || new Date().getFullYear()
  const regex = new RegExp(`([^.!?]{12,150}?)\\s+((${MONTHS})\\s+\\d{1,2}(?:,\\s*20\\d{2})?|20\\d{2}-\\d{2}-\\d{2})`, "gi")
  const out: any[] = []
  const limit = Math.min(Math.max(Number(source.max_candidates || 8), 3), 12)
  let match: RegExpExecArray | null

  while ((match = regex.exec(plain)) && out.length < limit * 3) {
    const date = parseDate(match[2], yearHint)
    if (!date || date < start || date > end) continue

    let title = match[1].replace(/\s+/g, " ").replace(/^[-–|:;, ]+|[-–|:;, ]+$/g, "").slice(-120).trim()
    title = title.replace(/^(and|or|at|on|for|from|with|the)\s+/i, "")
    if (title.length < 10 || NOISE_WORDS.test(title)) continue

    const excerptStart = Math.max(0, match.index - 120)
    const excerptEnd = Math.min(plain.length, regex.lastIndex + 180)
    const excerpt = plain.slice(excerptStart, excerptEnd).trim()
    const hasEventWord = EVENT_WORDS.test(`${title} ${excerpt}`)
    if (!hasEventWord && title.split(" ").length < 4) continue

    let confidence = 0.5
    if (hasEventWord) confidence += 0.14
    if (source.community) confidence += 0.06
    if (/\b(at|hall|centre|center|school|museum|park|library|community|arena|field|church|house|studio|online|zoom)\b/i.test(excerpt)) confidence += 0.06
    if (/\b(am|pm|a\.m\.|p\.m\.|noon|midnight|all day)\b/i.test(excerpt)) confidence += 0.05
    if (Number(source.quality_score || 0.5) >= 0.7) confidence += 0.05
    confidence = Math.min(0.92, Number(confidence.toFixed(2)))
    if (confidence < 0.64) continue

    const missing: string[] = []
    if (!source.community) missing.push("community")
    if (!/\b(am|pm|a\.m\.|p\.m\.|noon|midnight|all day)\b/i.test(excerpt)) missing.push("time")
    if (!/\b(at|hall|centre|center|school|museum|park|library|community|arena|field|church|house|studio|online|zoom)\b/i.test(excerpt)) missing.push("location")

    out.push({
      title,
      start_date: date,
      end_date: date,
      description: `Possible event found on ${source.name}. Verify against the source before promotion.`,
      community: source.community || null,
      location: null,
      source_name: source.name,
      source_url: source.url,
      source_excerpt: excerpt,
      confidence,
      missing_fields: missing,
    })
  }

  const deduped: any[] = []
  for (const candidate of out) {
    if (deduped.some((existing) => existing.start_date === candidate.start_date && similarity(existing.title, candidate.title) >= 0.72)) continue
    deduped.push(candidate)
    if (deduped.length >= limit) break
  }
  return deduped
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await clients(req)
    const { data, error } = await db.from("hgn_event_sources").select("*").order("name")
    if (error) throw error
    return NextResponse.json({ sources: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes("access") ? 403 : 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db, user } = await clients(req)
    const body = await req.json()

    if (body.action === "discover_sources") {
      const rawQueries = Array.isArray(body.queries) ? body.queries : []
      const queries = rawQueries.length ? rawQueries.slice(0, 6) : [
        "Haida Gwaii events calendar", "Haida Gwaii community events", "Haida Gwaii festival events",
        "Haida Gwaii recreation events", "Haida Gwaii arts events", "Haida Gwaii school events",
      ]
      const { data: existing } = await db.from("hgn_event_sources").select("id,url")
      const known = new Set((existing || []).map((x: any) => { try { return new URL(x.url).hostname.replace(/^www\./, "") } catch { return String(x.url || "") } }))
      let added = 0
      let skipped = 0
      const discovered: any[] = []
      for (const query of queries) {
        try {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(String(query))}`, {
            cache: "no-store", headers: { "User-Agent": "HaidaGwaiiNews/1.0 source discovery" }, signal: AbortSignal.timeout(12000),
          })
          if (!response.ok) continue
          const html = await response.text()
          for (const candidate of discoveryCandidates(html)) {
            let host = ""
            try { host = new URL(candidate.url).hostname.replace(/^www\./, "") } catch { continue }
            if (!host || known.has(host) || /facebook\.com|instagram\.com|youtube\.com|x\.com|twitter\.com/i.test(host)) { skipped++; continue }
            known.add(host)
            const row = {
              name: candidate.name, url: candidate.url, community: null, active: false, source_type: "discovered",
              quality_score: 0.5, max_candidates: 5, source_lifecycle: "candidate", review_status: "candidate",
              discovered_at: new Date().toISOString(), last_discovered_at: new Date().toISOString(), discovered_query: String(query),
              discovery_note: "Automatically discovered by AI Desk source discovery. Review before trusting.",
            }
            const { data, error } = await db.from("hgn_event_sources").insert(row).select().single()
            if (!error && data) { discovered.push(data); added++; }
          }
        } catch {}
      }
      return NextResponse.json({ added, skipped, discovered })
    }

    if (body.action === "review_source") {
      const lifecycle = ["trusted","watch","one_time","ignored"].includes(body.source_lifecycle) ? body.source_lifecycle : "trusted"
      const ignored = lifecycle === "ignored"
      const { error } = await db.from("hgn_event_sources").update({
        source_lifecycle: lifecycle, review_status: ignored ? "ignored" : "approved", active: !ignored,
        quality_score: ignored ? 0 : Math.min(1, Math.max(0.3, Number(body.quality_score ?? 0.7))),
        max_candidates: Math.min(12, Math.max(3, Number(body.max_candidates ?? 5))), updated_at: new Date().toISOString(),
      }).eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (body.action === "add_source") {
      const { data, error } = await db.from("hgn_event_sources").insert({
        name: body.name,
        url: body.url,
        community: body.community || null,
        source_type: body.source_type || "community",
        quality_score: 0.5,
        max_candidates: 8,
      }).select().single()
      if (error) throw error
      return NextResponse.json({ source: data })
    }

    if (body.action === "update_source") {
      const { error } = await db.from("hgn_event_sources").update({
        active: Boolean(body.active),
        quality_score: Math.min(1, Math.max(0, Number(body.quality_score ?? 0.5))),
        max_candidates: Math.min(12, Math.max(3, Number(body.max_candidates ?? 8))),
        updated_at: new Date().toISOString(),
      }).eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    const start = String(body.start_date || "")
    const end = String(body.end_date || "")
    if (!start || !end || end < start) return NextResponse.json({ error: "Choose a valid date range." }, { status: 400 })

    let q = db.from("hgn_event_sources").select("*").eq("active", true).eq("review_status", "approved")
    if (Array.isArray(body.source_ids) && body.source_ids.length) q = q.in("id", body.source_ids)
    const { data: sources, error } = await q
    if (error) throw error

    const { data: existingEvents } = await db.from("events").select("title,start_date").gte("start_date", start).lte("start_date", end)
    const { data: existingAi } = await db.from("ai_desk_items").select("title,payload,status").eq("item_type", "event").in("status", ["pending", "approved", "completed"]).limit(500)
    const known = [
      ...(existingEvents || []).map((x: any) => ({ title: String(x.title || ""), date: x.start_date })),
      ...(existingAi || []).map((x: any) => ({ title: String(x.title || ""), date: x.payload?.start_date || null })),
    ]

    let found = 0
    let duplicates = 0
    let failed = 0

    for (const source of sources || []) {
      let sourceFound = 0
      let sourceDuplicates = 0
      try {
        const response = await fetch(source.url, {
          cache: "no-store",
          headers: { "User-Agent": "HaidaGwaiiNews/1.0 event research" },
          signal: AbortSignal.timeout(12000),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const html = await response.text()

        for (const candidate of buildCandidates(html, start, end, source)) {
          const isDuplicate = known.some((x) => x.date === candidate.start_date && similarity(x.title, candidate.title) >= 0.72)
          if (isDuplicate) {
            duplicates++
            sourceDuplicates++
            continue
          }

          const key = `${normalizeTitle(candidate.title).replace(/\s+/g, "")}|${candidate.start_date}`
          const { error: insertError } = await db.from("ai_desk_items").insert({
            item_type: "event",
            title: candidate.title,
            summary: candidate.description,
            source_name: candidate.source_name,
            source_url: candidate.source_url,
            priority: candidate.confidence >= 0.8 ? "high" : "normal",
            confidence: candidate.confidence,
            agent_name: "AI Desk Event Finder",
            origin: "ai_event_finder",
            verification_status: "unverified",
            dedupe_key: `event-scan:${key}`,
            payload: {
              start_date: candidate.start_date,
              end_date: candidate.end_date,
              community: candidate.community,
              location: candidate.location,
              source_excerpt: candidate.source_excerpt,
              missing_fields: candidate.missing_fields,
              scan_range: { start, end },
            },
          })
          if (!insertError) {
            found++
            sourceFound++
            known.push({ title: candidate.title, date: candidate.start_date })
          }
        }

        await db.from("hgn_event_sources").update({
          last_checked_at: new Date().toISOString(),
          last_status: "success",
          active: source.source_lifecycle === "one_time" ? false : source.active,
          last_error: null,
          last_candidate_count: sourceFound,
          last_duplicate_count: sourceDuplicates,
        }).eq("id", source.id)
      } catch (e: any) {
        failed++
        await db.from("hgn_event_sources").update({
          last_checked_at: new Date().toISOString(),
          last_status: "failed",
          last_error: e.message,
          last_candidate_count: 0,
        }).eq("id", source.id)
      }
    }

    return NextResponse.json({ found, duplicates, failed, sources: (sources || []).length, scanned_by: user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes("access") ? 403 : 400 })
  }
}
