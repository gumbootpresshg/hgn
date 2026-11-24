import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Highway 16 inside Haida Gwaii only. The bounding box prevents mainland Highway 16 events.
const DRIVEBC_URL = "https://api.open511.gov.bc.ca/events?status=ACTIVE&road_name=Highway%2016&bbox=-133.45,52.00,-131.00,54.40"
const SOURCE_KEY = "drivebc-haida-gwaii-highway-16"
const DRIVEBC_PAGE = "https://www.drivebc.ca/"

type RoadEvent = {
  id?: string
  headline?: string
  description?: string
  severity?: string
  status?: string
  url?: string
  roads?: Array<{ name?: string; from?: string; to?: string }>
  schedule?: Array<{ start_date?: string; end_date?: string }>
}

function text(value: unknown) { return String(value || "").replace(/\s+/g, " ").trim() }

function affectsHighway16(event: RoadEvent) {
  const roads = (event.roads || []).map((road) => text(road.name)).join(" ")
  return /highway\s*16\b/i.test(`${roads} ${event.headline || ""} ${event.description || ""}`)
}

function isMajorClosure(event: RoadEvent) {
  const value = `${event.headline || ""} ${event.description || ""}`.toLowerCase()
  return /(?:full |entire |highway |road )?(?:road |highway )?(?:is |remains |are )?(?:fully )?closed\b|full closure|impassable|washout|no through traffic|roadway closed/.test(value)
}

function roadRange(event: RoadEvent) {
  const road = event.roads?.find((item) => /highway\s*16\b/i.test(text(item.name))) || event.roads?.[0]
  const locations = [road?.from, road?.to].map(text).filter(Boolean)
  return locations.length === 2 ? `${locations[0]} to ${locations[1]}` : locations[0] || "Highway 16"
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 })
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: "Server settings incomplete" }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })
  const now = new Date().toISOString()

  try {
    const response = await fetch(DRIVEBC_URL, {
      headers: { "User-Agent": "HaidaGwaiiNews-RoadAlert/1.0 (+https://haidagwaiinews.com)" },
      cache: "no-store", signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`DriveBC returned HTTP ${response.status}`)
    const payload = await response.json() as { events?: RoadEvent[] }
    const closures = (payload.events || []).filter((event) => affectsHighway16(event) && isMajorClosure(event))
    const { data: existing, error: existingError } = await db.from("site_alerts").select("id").eq("source_key", SOURCE_KEY).maybeSingle()
    if (existingError) throw existingError

    if (!closures.length) {
      if (existing?.id) await db.from("site_alerts").update({ status: "expired", ends_at: now, last_synced_at: now }).eq("id", existing.id)
      return NextResponse.json({ active: false, action: existing?.id ? "expired" : "none" })
    }

    const primary = closures[0]
    const more = closures.length > 1 ? ` ${closures.length - 1} additional Highway 16 closure${closures.length === 2 ? "" : "s"} reported.` : ""
    const record = {
      label: "HIGHWAY 16 ROAD CLOSURE",
      kind: "road",
      message: `${text(primary.headline) || "Highway 16 closure"}: ${roadRange(primary)}.${more}`.slice(0, 420),
      weather_summary: text(primary.description).slice(0, 700) || null,
      weather_communities: [],
      // Open511 event URLs are API documents (often raw XML), not reader pages.
      url: DRIVEBC_PAGE,
      source_name: "DriveBC",
      priority: 95,
      status: "active",
      starts_at: now,
      ends_at: null,
      source_key: SOURCE_KEY,
      automated: true,
      last_synced_at: now,
    }
    const result = existing?.id ? await db.from("site_alerts").update(record).eq("id", existing.id) : await db.from("site_alerts").insert(record)
    if (result.error) throw result.error
    return NextResponse.json({ active: true, action: existing?.id ? "updated" : "created", closures: closures.length })
  } catch (error: any) {
    // A source outage must never remove a real road-closure alert already on the site.
    return NextResponse.json({ error: error?.message || "Unable to refresh DriveBC road closures" }, { status: 502 })
  }
}
