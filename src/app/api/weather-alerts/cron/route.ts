import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WEATHER_ALERTS_URL = "https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=1000"
const WARNING_PAGE = "https://weather.gc.ca/warnings/index_e.html?prov=bc"
const SOURCE_KEY = "environment-canada-haida-gwaii-wind"
const HGN_AREAS = /haida\s*gwaii|queen\s*charlotte\s*islands|north\s*coast.*haida/i

type EnvironmentCanadaFeature = {
  id?: string
  properties?: Record<string, unknown>
}

function plainText(value: unknown) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function firstUsefulSentence(value: string) {
  const compact = plainText(value)
  const match = compact.match(/(?:What|Details|Hazards?|Wind)\s*:?\s*([^.!?]+[.!?])?/i)
  return (match?.[1] || compact).slice(0, 280).trim()
}

function extractSection(value: string, heading: string) {
  const text = plainText(value)
  const match = text.match(new RegExp(`${heading}\\s*:?\\s*(.+?)(?=\\s+(?:When|Where|Remarks?|Additional|###)\\s*:|$)`, "i"))
  return match?.[1]?.trim().slice(0, 180) || ""
}

function isActive(properties: Record<string, unknown>) {
  const status = plainText(properties.status_en || properties.display_status).toLowerCase()
  const expiry = String(properties.expiration_datetime || properties.event_end_datetime || "")
  const expiryTime = Date.parse(expiry)
  return !/ended|cancelled|expired|inactive/.test(status) && (!Number.isFinite(expiryTime) || expiryTime > Date.now())
}

function matchingWindAlert(feature: EnvironmentCanadaFeature) {
  const properties = feature.properties || {}
  const area = plainText(properties.feature_name_en)
  const name = plainText(properties.alert_name_en || properties.alert_short_name_en)
  const text = plainText(properties.alert_text_en)
  return HGN_AREAS.test(area) && /wind/i.test(`${name} ${text}`) && isActive(properties)
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
    const response = await fetch(WEATHER_ALERTS_URL, {
      headers: { "User-Agent": "HaidaGwaiiNews-WeatherAlert/1.0 (+https://haidagwaiinews.com)" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Environment Canada returned HTTP ${response.status}`)

    const payload = await response.json() as { features?: EnvironmentCanadaFeature[] }
    const alert = (payload.features || []).find(matchingWindAlert)
    const { data: existing, error: existingError } = await db.from("site_alerts").select("id").eq("source_key", SOURCE_KEY).maybeSingle()
    if (existingError) throw existingError

    if (!alert) {
      if (existing?.id) await db.from("site_alerts").update({ status: "expired", ends_at: now, last_synced_at: now }).eq("id", existing.id)
      return NextResponse.json({ active: false, action: existing?.id ? "expired" : "none" })
    }

    const properties = alert.properties || {}
    const area = plainText(properties.feature_name_en) || "Haida Gwaii"
    const alertName = plainText(properties.alert_name_en || properties.alert_short_name_en) || "Wind warning"
    const alertText = plainText(properties.alert_text_en)
    const what = extractSection(alertText, "What") || firstUsefulSentence(alertText)
    const when = extractSection(alertText, "When")
    const endsAt = String(properties.expiration_datetime || properties.event_end_datetime || "") || null
    const record = {
      label: alertName.toUpperCase(),
      kind: "weather",
      message: `${alertName} for ${area}.`,
      weather_summary: what || "See the official Environment Canada warning for details.",
      weather_communities: [{ name: area, steadyWind: what || undefined, gusts: "", timing: when || undefined }],
      url: WARNING_PAGE,
      source_name: "Environment Canada",
      priority: 90,
      status: "active",
      starts_at: String(properties.publication_datetime || properties.validity_datetime || now),
      ends_at: endsAt,
      source_key: SOURCE_KEY,
      automated: true,
      last_synced_at: now,
    }

    const result = existing?.id
      ? await db.from("site_alerts").update(record).eq("id", existing.id)
      : await db.from("site_alerts").insert(record)
    if (result.error) throw result.error

    return NextResponse.json({ active: true, action: existing?.id ? "updated" : "created", area, alert: alertName })
  } catch (error: any) {
    // Do not remove a live warning just because the government feed has a temporary problem.
    return NextResponse.json({ error: error?.message || "Unable to refresh Environment Canada alerts" }, { status: 502 })
  }
}
