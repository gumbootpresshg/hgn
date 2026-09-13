import type { SupabaseClient } from "@supabase/supabase-js"

export type DiscoverySettings = {
  enabled: boolean
  publication_area: string
  communities: string[]
  event_types: string[]
  organizations: string[]
  custom_terms: string[]
  excluded_terms: string[]
  lookahead_days: number
}

export const DEFAULT_DISCOVERY_SETTINGS: DiscoverySettings = {
  enabled: true,
  publication_area: "Haida Gwaii",
  communities: ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Moresby Island", "Graham Island"],
  event_types: ["community events", "festivals", "markets", "fundraisers", "sports", "school events", "arts", "concerts", "workshops", "meetings", "recreation", "fairs", "cultural events", "business events"],
  organizations: ["Village of Masset", "Village of Daajing Giids", "Village of Port Clements", "Old Massett Village Council", "Skidegate Band Council", "School District 50", "Haida Heritage Centre"],
  custom_terms: [],
  excluded_terms: [],
  lookahead_days: 90,
}

const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
const EVENT_WORDS = /\b(event|festival|fair|meeting|workshop|concert|market|fundraiser|tournament|game|race|screening|show|dance|dinner|lunch|breakfast|open house|celebration|ceremony|registration|class|session|presentation|talk|lecture|gathering|sale|clinic|camp|performance|AGM|open mic)\b/i
const NOISE_WORDS = /\b(home|about|contact|privacy|menu|search|login|sign in|copyright|subscribe|newsletter|navigation|read more|learn more|click here|calendar view|terms of use)\b/i
const BLOCKED_HOSTS = /(^|\.)(facebook\.com|instagram\.com|youtube\.com|x\.com|twitter\.com|tiktok\.com)$/i

type SearchCandidate = { name: string; url: string; query: string }
type KnownItem = { title: string; date: string | null }

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

function hostFor(value: string) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, "") } catch { return "" }
}

function isAllowedUrl(value: string) {
  if (!/^https?:\/\//i.test(value)) return false
  const host = hostFor(value)
  return Boolean(host) && !BLOCKED_HOSTS.test(host)
}

function parseDuckDuckGo(html: string, query: string) {
  const out: SearchCandidate[] = []
  const re = /<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) && out.length < 15) {
    const url = absoluteDuckUrl(m[1]).replace(/&amp;/g, "&")
    const name = cleanText(m[2]).slice(0, 160)
    if (isAllowedUrl(url) && name) out.push({ name, url, query })
  }
  return out
}

function parseBing(html: string, query: string) {
  const out: SearchCandidate[] = []
  const re = /<li[^>]+class=["'][^"']*b_algo[^"']*["'][\s\S]*?<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) && out.length < 15) {
    const url = m[1].replace(/&amp;/g, "&")
    const name = cleanText(m[2]).slice(0, 160)
    if (isAllowedUrl(url) && name) out.push({ name, url, query })
  }
  return out
}

async function searchWeb(query: string) {
  const headers = { "User-Agent": "Mozilla/5.0 (compatible; HaidaGwaiiNews/1.0; +https://haidagwaiinews.com)" }
  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { cache: "no-store", headers, signal: AbortSignal.timeout(9000) })
    if (response.ok) {
      const results = parseDuckDuckGo(await response.text(), query)
      if (results.length) return results
    }
  } catch {}
  try {
    const response = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`, { cache: "no-store", headers, signal: AbortSignal.timeout(9000) })
    if (response.ok) return parseBing(await response.text(), query)
  } catch {}
  return []
}

function localDate(offsetDays = 0) {
  const shifted = new Date(Date.now() + offsetDays * 86400000)
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(shifted)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.year}-${map.month}-${map.day}`
}

function stringList(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map(String).map((x) => x.trim()).filter(Boolean).slice(0, 60) : fallback
}

export function normalizeDiscoverySettings(value: any): DiscoverySettings {
  return {
    enabled: value?.enabled !== false,
    publication_area: String(value?.publication_area || DEFAULT_DISCOVERY_SETTINGS.publication_area).trim().slice(0, 120),
    communities: stringList(value?.communities, DEFAULT_DISCOVERY_SETTINGS.communities),
    event_types: stringList(value?.event_types, DEFAULT_DISCOVERY_SETTINGS.event_types),
    organizations: stringList(value?.organizations, DEFAULT_DISCOVERY_SETTINGS.organizations),
    custom_terms: stringList(value?.custom_terms, []),
    excluded_terms: stringList(value?.excluded_terms, []),
    lookahead_days: Math.min(180, Math.max(14, Number(value?.lookahead_days || 90))),
  }
}

export async function loadDiscoverySettings(db: SupabaseClient): Promise<DiscoverySettings> {
  const { data } = await db.from("hgn_ai_discovery_settings").select("settings").eq("singleton_key", "default").maybeSingle()
  return normalizeDiscoverySettings(data?.settings || DEFAULT_DISCOVERY_SETTINGS)
}

export async function saveDiscoverySettings(db: SupabaseClient, settings: DiscoverySettings, userId?: string | null) {
  const normalized = normalizeDiscoverySettings(settings)
  const { error } = await db.from("hgn_ai_discovery_settings").upsert({ singleton_key: "default", settings: normalized, updated_at: new Date().toISOString(), updated_by: userId || null }, { onConflict: "singleton_key" })
  if (error) throw error
  return normalized
}

export function generateDiscoveryQueries(settings: DiscoverySettings, maxQueries = 18) {
  const year = new Date().getFullYear()
  const queries: string[] = []
  const area = settings.publication_area
  const types = settings.event_types.length ? settings.event_types : ["events"]
  queries.push(`${area} events calendar ${year}`, `${area} community events`, `${area} upcoming events`)
  for (const community of settings.communities.slice(0, 10)) {
    queries.push(`${community} events`, `${community} community calendar`)
  }
  for (const type of types.slice(0, 8)) queries.push(`${area} ${type}`)
  for (const org of settings.organizations.slice(0, 8)) queries.push(`"${org}" events`, `"${org}" calendar`)
  for (const term of settings.custom_terms.slice(0, 8)) queries.push(`${area} ${term}`)
  return [...new Set(queries)].slice(0, maxQueries)
}

function excluded(text: string, settings: DiscoverySettings) {
  const haystack = text.toLowerCase()
  return settings.excluded_terms.some((term) => term && haystack.includes(term.toLowerCase()))
}

function findCommunity(text: string, settings: DiscoverySettings) {
  const lower = text.toLowerCase()
  return settings.communities.find((community) => lower.includes(community.toLowerCase())) || null
}

function buildCandidates(body: string, start: string, end: string, source: any, settings: DiscoverySettings) {
  const plain = cleanText(body)
  if (!plain || excluded(plain, settings)) return []
  const yearHint = Number(start.slice(0, 4)) || new Date().getFullYear()
  const regex = new RegExp(`([^.!?]{12,170}?)\\s+((${MONTHS})\\s+\\d{1,2}(?:,\\s*20\\d{2})?|20\\d{2}-\\d{2}-\\d{2})`, "gi")
  const out: any[] = []
  const limit = Math.min(Math.max(Number(source.max_candidates || 6), 3), 10)
  let match: RegExpExecArray | null

  while ((match = regex.exec(plain)) && out.length < limit * 3) {
    const date = parseDate(match[2], yearHint)
    if (!date || date < start || date > end) continue
    let title = match[1].replace(/\s+/g, " ").replace(/^[-–|:;, ]+|[-–|:;, ]+$/g, "").slice(-140).trim()
    title = title.replace(/^(and|or|at|on|for|from|with|the)\s+/i, "")
    if (title.length < 10 || NOISE_WORDS.test(title) || excluded(title, settings)) continue
    const excerpt = plain.slice(Math.max(0, match.index - 150), Math.min(plain.length, regex.lastIndex + 220)).trim()
    const hasEventWord = EVENT_WORDS.test(`${title} ${excerpt}`)
    if (!hasEventWord && title.split(" ").length < 4) continue
    const community = source.community || findCommunity(`${title} ${excerpt}`, settings)
    let confidence = 0.52
    if (hasEventWord) confidence += 0.14
    if (community) confidence += 0.08
    if (/\b(at|hall|centre|center|school|museum|park|library|community|arena|field|church|house|studio|online|zoom|theatre|theater)\b/i.test(excerpt)) confidence += 0.06
    if (/\b(am|pm|a\.m\.|p\.m\.|noon|midnight|all day)\b/i.test(excerpt)) confidence += 0.05
    if (Number(source.quality_score || 0.5) >= 0.7) confidence += 0.04
    confidence = Math.min(0.94, Number(confidence.toFixed(2)))
    if (confidence < 0.65) continue
    const missing: string[] = []
    if (!community) missing.push("community")
    if (!/\b(am|pm|a\.m\.|p\.m\.|noon|midnight|all day)\b/i.test(excerpt)) missing.push("time")
    if (!/\b(at|hall|centre|center|school|museum|park|library|community|arena|field|church|house|studio|online|zoom|theatre|theater)\b/i.test(excerpt)) missing.push("location")
    out.push({ title, start_date: date, end_date: date, description: `Possible event found by HGN AI research. Verify against the source before promotion.`, community, location: null, source_name: source.name, source_url: source.url, source_excerpt: excerpt, confidence, missing_fields: missing })
  }
  const deduped: any[] = []
  for (const candidate of out) {
    if (deduped.some((existing) => existing.start_date === candidate.start_date && similarity(existing.title, candidate.title) >= 0.72)) continue
    deduped.push(candidate)
    if (deduped.length >= limit) break
  }
  return deduped
}

async function existingKnown(db: SupabaseClient, start: string, end: string): Promise<KnownItem[]> {
  const [{ data: events }, { data: ai }] = await Promise.all([
    db.from("events").select("title,start_date").gte("start_date", start).lte("start_date", end),
    db.from("ai_desk_items").select("title,payload,status").eq("item_type", "event").in("status", ["pending", "approved", "completed"]).limit(500),
  ])
  return [
    ...(events || []).map((x: any) => ({ title: String(x.title || ""), date: x.start_date || null })),
    ...(ai || []).map((x: any) => ({ title: String(x.title || ""), date: x.payload?.start_date || null })),
  ]
}

async function insertCandidates(db: SupabaseClient, candidates: any[], known: KnownItem[]) {
  let found = 0
  let duplicates = 0
  for (const candidate of candidates) {
    if (known.some((x) => x.date === candidate.start_date && similarity(x.title, candidate.title) >= 0.72)) { duplicates++; continue }
    const key = `${normalizeTitle(candidate.title).replace(/\s+/g, "")}|${candidate.start_date}`
    const { error } = await db.from("ai_desk_items").insert({
      item_type: "event", title: candidate.title, summary: candidate.description, source_name: candidate.source_name, source_url: candidate.source_url,
      priority: candidate.confidence >= 0.82 ? "high" : "normal", confidence: candidate.confidence, agent_name: "AI Desk Event Finder", origin: "ai_event_finder",
      verification_status: "unverified", dedupe_key: `event-scan:${key}`,
      payload: { start_date: candidate.start_date, end_date: candidate.end_date, community: candidate.community, location: candidate.location, source_excerpt: candidate.source_excerpt, missing_fields: candidate.missing_fields },
    })
    if (!error) { found++; known.push({ title: candidate.title, date: candidate.start_date }) }
  }
  return { found, duplicates }
}

async function upsertAutoSource(db: SupabaseClient, result: SearchCandidate, useful: boolean) {
  const { data: existing } = await db.from("hgn_event_sources").select("id,quality_score,successful_scans").eq("url", result.url).maybeSingle()
  const now = new Date().toISOString()
  if (existing?.id) {
    const nextQuality = useful ? Math.min(0.95, Number(existing.quality_score || 0.5) + 0.05) : Number(existing.quality_score || 0.5)
    await db.from("hgn_event_sources").update({ last_discovered_at: now, discovered_query: result.query, quality_score: nextQuality, ...(useful ? { active: true, review_status: "approved", source_lifecycle: "watch", last_useful_at: now } : {}) }).eq("id", existing.id)
    return existing.id
  }
  const { data } = await db.from("hgn_event_sources").insert({
    name: result.name, url: result.url, community: null, active: useful, source_type: "auto_discovered", quality_score: useful ? 0.65 : 0.5, max_candidates: 6,
    source_lifecycle: useful ? "watch" : "candidate", review_status: useful ? "approved" : "candidate", discovered_at: now, last_discovered_at: now,
    discovered_query: result.query, discovery_note: useful ? "Automatically found and produced useful event research." : "Automatically found. Kept in source health for future evaluation.", auto_managed: true,
  }).select("id").single()
  return data?.id || null
}

async function fetchAndScan(db: SupabaseClient, source: any, start: string, end: string, settings: DiscoverySettings, known: KnownItem[]) {
  let found = 0
  let duplicates = 0
  try {
    const response = await fetch(source.url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 (compatible; HaidaGwaiiNews/1.0; +https://haidagwaiinews.com)" }, signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    const result = await insertCandidates(db, buildCandidates(html, start, end, source, settings), known)
    found = result.found
    duplicates = result.duplicates
    if (source.id) {
      const quality = Math.min(0.95, Math.max(0.25, Number(source.quality_score || 0.5) + (found > 0 ? 0.05 : -0.01)))
      await db.from("hgn_event_sources").update({ last_checked_at: new Date().toISOString(), last_status: "success", last_error: null, last_candidate_count: found, last_duplicate_count: duplicates, quality_score: quality, consecutive_failures: 0, successful_scans: Number(source.successful_scans || 0) + 1, ...(found > 0 ? { last_useful_at: new Date().toISOString() } : {}) }).eq("id", source.id)
    }
    return { found, duplicates, failed: 0 }
  } catch (error: any) {
    if (source.id) {
      const failures = Number(source.consecutive_failures || 0) + 1
      await db.from("hgn_event_sources").update({ last_checked_at: new Date().toISOString(), last_status: "failed", last_error: String(error?.message || error).slice(0, 300), last_candidate_count: 0, consecutive_failures: failures, ...(source.auto_managed && failures >= 4 ? { active: false } : {}) }).eq("id", source.id)
    }
    return { found: 0, duplicates: 0, failed: 1 }
  }
}


async function mapInBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const out: R[] = []
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size)
    out.push(...await Promise.all(batch.map(fn)))
  }
  return out
}

export async function runAutomaticEventDiscovery(db: SupabaseClient, options: { maxQueries?: number; maxWebPages?: number; includeExistingSources?: boolean } = {}) {
  const settings = await loadDiscoverySettings(db)
  if (!settings.enabled) return { enabled: false, found: 0, duplicates: 0, failed: 0, searches: 0, pages_checked: 0, new_sources: 0 }
  const start = localDate(0)
  const end = localDate(settings.lookahead_days)
  const known = await existingKnown(db, start, end)
  const queries = generateDiscoveryQueries(settings, options.maxQueries || 14)
  const searchResults = await Promise.allSettled(queries.map((query) => searchWeb(query)))
  const byUrl = new Map<string, SearchCandidate>()
  for (const result of searchResults) if (result.status === "fulfilled") for (const candidate of result.value) if (!byUrl.has(candidate.url)) byUrl.set(candidate.url, candidate)
  const discovered = [...byUrl.values()].slice(0, options.maxWebPages || 18)

  let found = 0, duplicates = 0, failed = 0, newSources = 0, pagesChecked = 0
  const { data: existingRows } = await db.from("hgn_event_sources").select("*").eq("active", true).eq("review_status", "approved").order("quality_score", { ascending: false }).limit(12)
  if (options.includeExistingSources !== false) {
    const sourceResults = await mapInBatches(existingRows || [], 4, (source: any) => fetchAndScan(db, source, start, end, settings, known))
    for (const result of sourceResults) { found += result.found; duplicates += result.duplicates; failed += result.failed; pagesChecked++ }
  }

  const discoveredResults = await mapInBatches(discovered.filter((result) => !excluded(`${result.name} ${result.url}`, settings)), 4, async (result) => {
    const pseudo = { name: result.name, url: result.url, community: findCommunity(`${result.name} ${result.url}`, settings), quality_score: 0.55, max_candidates: 5 }
    try {
      const response = await fetch(result.url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 (compatible; HaidaGwaiiNews/1.0; +https://haidagwaiinews.com)" }, signal: AbortSignal.timeout(8000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const candidates = buildCandidates(await response.text(), start, end, pseudo, settings)
      const inserted = await insertCandidates(db, candidates, known)
      const before = await db.from("hgn_event_sources").select("id").eq("url", result.url).maybeSingle()
      await upsertAutoSource(db, result, inserted.found > 0)
      return { found: inserted.found, duplicates: inserted.duplicates, failed: 0, page: 1, newSource: before.data?.id ? 0 : 1 }
    } catch { return { found: 0, duplicates: 0, failed: 1, page: 0, newSource: 0 } }
  })
  for (const result of discoveredResults) { found += result.found; duplicates += result.duplicates; failed += result.failed; pagesChecked += result.page; newSources += result.newSource }
  return { enabled: true, found, duplicates, failed, searches: queries.length, pages_checked: pagesChecked, new_sources: newSources, start, end }
}
