import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const FEED_URL = "https://weather.gc.ca/rss/battleboard/tsu1_t_e.xml"
const REPORT_URL = "https://weather.gc.ca/warnings/report_tsunami_e.html?mesoCode=tsu1"

function pick(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))
  return cleanXml(match?.[1] || "")
}

function pickFromBlock(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))
  return cleanXml(match?.[1] || "")
}

function cleanXml(value: string) {
  return value
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function formatUpdated(value?: string) {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Vancouver",
      timeZoneName: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

export async function GET() {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Haida Gwaii News Weather Desk" },
    })

    if (!response.ok) {
      throw new Error(`Environment Canada feed request failed: ${response.status}`)
    }

    const xml = await response.text()
    const entryMatch = xml.match(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/i)
    const entry = entryMatch?.[1] || ""

    const feedTitle = pick(xml, "title")
    const title = pickFromBlock(entry, "title") || feedTitle || "Tsunami alert status unavailable"
    const summary = pickFromBlock(entry, "summary")
    const updated = pickFromBlock(entry, "updated") || pick(xml, "updated")

    const active =
      !title.toLowerCase().includes("no alerts") &&
      !summary.toLowerCase().includes("no alerts in effect")

    return NextResponse.json({
      active,
      title,
      summary,
      updated,
      updatedLocal: formatUpdated(updated),
      source: "Environment Canada",
      feedUrl: FEED_URL,
      reportUrl: REPORT_URL,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        active: false,
        title: "Tsunami alert status unavailable",
        summary: "Unable to load the Environment Canada tsunami alert feed right now.",
        error: error?.message || "Unable to load tsunami alert feed",
        source: "Environment Canada",
        feedUrl: FEED_URL,
        reportUrl: REPORT_URL,
      },
      { status: 200 }
    )
  }
}
