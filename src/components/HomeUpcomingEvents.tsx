import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvents } from "@/lib/public-events"
import { formatEventDateOnly, formatEventDateTime } from "@/lib/event-format"
import { eventOverlapsRange } from "@/lib/events"
import { getPublishingSettings, publishingDateInputValue } from "@/lib/publishing-settings"

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export default async function HomeUpcomingEvents({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean } = {}) {
  const publishingSettings = await getPublishingSettings()
  const today = publishingDateInputValue(new Date(), publishingSettings)
  const weekEndExclusive = addDays(today, 8)
  const { data } = await fetchPublicEvents(supabase)

  const events = (data || [])
    .filter((event: any) => eventOverlapsRange(event, today, weekEndExclusive))
    .sort((a: any, b: any) => {
      const aDate = String(a.start_date || a.event_date || "")
      const bDate = String(b.start_date || b.event_date || "")
      return aDate.localeCompare(bDate) || String(a.start_time || "").localeCompare(String(b.start_time || ""))
    })
    .slice(0, 6)

  if (hideWhenEmpty && events.length === 0) return null

  return (
    <section className="my-6 overflow-hidden rounded-3xl border border-[#0e4361] bg-[#071f35] text-white shadow-sm">
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-300">What’s on Haida Gwaii</p>
          <h2 className="mt-2 font-serif text-4xl font-bold leading-none">Coming up this week</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-200">Markets, meetings, performances, sports and island gatherings — all in one place.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/events" className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#071f35]">View calendar →</Link>
            <Link href="/submit-event" className="rounded-full border border-white/50 px-5 py-3 text-sm font-black text-white">Add an event</Link>
          </div>
        </div>

        {events.length ? (
          <div className="grid gap-2">
            {events.map((event: any) => (
              <Link key={event.id} href={`/events#event-${event.id}`} className="grid grid-cols-[4.3rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 transition hover:bg-white/20">
                <p className="font-serif text-xs font-bold uppercase leading-5 text-red-200">{formatEventDateOnly(event)}</p>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg font-bold">{event.title}</h3>
                  <p className="mt-1 truncate text-xs text-stone-200">{[formatEventDateTime(event).replace(formatEventDateOnly(event), "").replace(/^\s*·\s*/, ""), event.location || event.community].filter(Boolean).join(" · ") || "Details on the event calendar"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/30 p-5 text-sm text-stone-200">No upcoming events have been published yet. Have one to share? Add it for review.</div>
        )}
      </div>
    </section>
  )
}
