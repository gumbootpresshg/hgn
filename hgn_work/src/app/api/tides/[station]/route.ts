import { NextResponse } from "next/server"
import { tideStations } from "@/lib/haida-weather-data"

export const dynamic = "force-dynamic"

type TidePoint = {
  eventDate?: string
  value?: number
  time?: string
}

function iso(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z")
}

function formatTime(value?: string) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Vancouver",
  }).format(new Date(value))
}

function findExtrema(points: TidePoint[]) {
  const sorted = points
    .filter((point) => point.eventDate && typeof point.value === "number")
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())

  const extrema: Array<TidePoint & { type: "High" | "Low" }> = []

  for (let i = 1; i < sorted.length - 1; i += 1) {
    const previous = sorted[i - 1].value!
    const current = sorted[i].value!
    const next = sorted[i + 1].value!

    if (current >= previous && current >= next) {
      extrema.push({ ...sorted[i], type: "High" })
    }

    if (current <= previous && current <= next) {
      extrema.push({ ...sorted[i], type: "Low" })
    }
  }

  const now = Date.now()
  const future = extrema.filter((point) => new Date(point.eventDate!).getTime() >= now)

  return {
    nextHigh: future.find((point) => point.type === "High") || null,
    nextLow: future.find((point) => point.type === "Low") || null,
    upcoming: future.slice(0, 8),
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ station: string }> }
) {
  const { station } = await context.params
  const stationInfo = tideStations.find((item) => item.slug === station || item.stationCode === station)

  if (!stationInfo) {
    return NextResponse.json({ error: "Unknown tide station" }, { status: 404 })
  }

  try {
    const stationResponse = await fetch(
      `https://api-iwls.dfo-mpo.gc.ca/api/v1/stations?code=${stationInfo.stationCode}`,
      { next: { revalidate: 60 * 30 } }
    )

    if (!stationResponse.ok) {
      throw new Error(`Station lookup failed: ${stationResponse.status}`)
    }

    const stationData = await stationResponse.json()
    const stationRecord = Array.isArray(stationData) ? stationData[0] : stationData

    if (!stationRecord?.id) {
      throw new Error("Station ID not found")
    }

    const from = new Date(Date.now() - 6 * 60 * 60 * 1000)
    const to = new Date(Date.now() + 54 * 60 * 60 * 1000)

    const dataUrl = new URL(`https://api-iwls.dfo-mpo.gc.ca/api/v1/stations/${stationRecord.id}/data`)
    dataUrl.searchParams.set("time-series-code", "wlp")
    dataUrl.searchParams.set("from", iso(from))
    dataUrl.searchParams.set("to", iso(to))
    dataUrl.searchParams.set("resolution", "SIXTY_MINUTES")

    const dataResponse = await fetch(dataUrl.toString(), { next: { revalidate: 60 * 30 } })

    if (!dataResponse.ok) {
      throw new Error(`Prediction lookup failed: ${dataResponse.status}`)
    }

    const points = await dataResponse.json()
    const extrema = findExtrema(Array.isArray(points) ? points : [])

    return NextResponse.json({
      station: stationInfo,
      source: "Canadian Hydrographic Service IWLS API",
      sourceUrl: stationInfo.officialUrl,
      generatedAt: new Date().toISOString(),
      nextHigh: extrema.nextHigh
        ? {
            time: extrema.nextHigh.eventDate,
            localTime: formatTime(extrema.nextHigh.eventDate),
            heightMetres: extrema.nextHigh.value,
          }
        : null,
      nextLow: extrema.nextLow
        ? {
            time: extrema.nextLow.eventDate,
            localTime: formatTime(extrema.nextLow.eventDate),
            heightMetres: extrema.nextLow.value,
          }
        : null,
      upcoming: extrema.upcoming.map((point) => ({
        type: point.type,
        time: point.eventDate,
        localTime: formatTime(point.eventDate),
        heightMetres: point.value,
      })),
      rawPointCount: Array.isArray(points) ? points.length : 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        station: stationInfo,
        source: "Canadian Hydrographic Service IWLS API",
        sourceUrl: stationInfo.officialUrl,
        error: error?.message || "Unable to load tide data",
      },
      { status: 200 }
    )
  }
}
