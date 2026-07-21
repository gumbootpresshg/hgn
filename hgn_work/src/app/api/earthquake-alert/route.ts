import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

// Centered roughly on Haida Gwaii. Radius catches offshore events near the islands.
const LAT = "53.50"
const LON = "-132.00"
const MAX_RADIUS_KM = "350"

function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function formatTime(value?: number) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Vancouver",
    timeZoneName: "short",
  }).format(new Date(value))
}

export async function GET() {
  try {
    const url = new URL(USGS_URL)
    url.searchParams.set("format", "geojson")
    url.searchParams.set("starttime", isoHoursAgo(168))
    url.searchParams.set("latitude", LAT)
    url.searchParams.set("longitude", LON)
    url.searchParams.set("maxradiuskm", MAX_RADIUS_KM)
    url.searchParams.set("minmagnitude", "2.5")
    url.searchParams.set("orderby", "time")
    url.searchParams.set("limit", "20")

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Haida Gwaii News Earthquake Desk" },
    })

    if (!response.ok) {
      throw new Error(`USGS earthquake feed failed: ${response.status}`)
    }

    const json = await response.json()
    const features = Array.isArray(json.features) ? json.features : []

    const events = features.map((feature: any) => {
      const props = feature.properties || {}
      const coords = feature.geometry?.coordinates || []
      return {
        id: feature.id,
        magnitude: props.mag,
        place: props.place,
        time: props.time,
        localTime: formatTime(props.time),
        url: props.url,
        detail: props.detail,
        longitude: coords[0],
        latitude: coords[1],
        depthKm: coords[2],
      }
    })

    const now = Date.now()
    const alertEvent = events.find((event: any) => {
      const ageHours = (now - Number(event.time || 0)) / (1000 * 60 * 60)
      return Number(event.magnitude || 0) >= 4 && ageHours <= 24
    })

    return NextResponse.json({
      active: Boolean(alertEvent),
      alertThreshold: "M4.0+ within 24 hours and within 350 km of Haida Gwaii",
      alert: alertEvent || null,
      events,
      source: "USGS Earthquake Hazards Program",
      sourceUrl: "https://earthquake.usgs.gov/fdsnws/event/1/",
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        active: false,
        alert: null,
        events: [],
        error: error?.message || "Unable to load earthquake feed",
        source: "USGS Earthquake Hazards Program",
        sourceUrl: "https://earthquake.usgs.gov/fdsnws/event/1/",
      },
      { status: 200 }
    )
  }
}
