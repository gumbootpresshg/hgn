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
    <section className="my-3 overflow-hidden rounded-2xl border border-[#0e4361] bg-[#071f35] text-white shadow-sm sm:my-4 sm:rounded-3xl">
      <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300 sm:text-[11px]">What’s on Haida Gwaii</p>
              <h2 className="mt-1 font-serif text-[2rem] font-bold leading-none sm:text-3xl">This week</h2>
            </div>
            <Link href="/events" className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-black text-[#071f35] sm:hidden">Calendar →</Link>
          </div>
          <p className="mt-2 hidden max-w-md text-sm leading-5 text-stone-200 sm:block">Markets, meetings, performances, sports and island gatherings — all in one place.</p>
          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            <Link href="/events" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#071f35]">View calendar →</Link>
            <Link href="/submit-event" className="rounded-full border border-white/50 px-4 py-2 text-sm font-black text-white">Add an event</Link>
          </div>
        </div>

        {events.length ? (
          <div className="grid gap-2">
            {events.slice(0, 3).map((event: any) => (
              <Link key={event.id} href={`/events#event-${event.id}`} className="grid grid-cols-[3.35rem_1fr] gap-2 rounded-xl bg-white/10 px-3 py-2.5 transition hover:bg-white/20 sm:grid-cols-[4.1rem_1fr] sm:rounded-2xl">
                <p className="font-serif text-[11px] font-bold uppercase leading-4 text-red-200 sm:text-xs sm:leading-5">{formatEventDateOnly(event)}</p>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-serif text-[15px] font-bold leading-5 sm:text-base">{event.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-stone-200">{[formatEventDateTime(event).replace(formatEventDateOnly(event), "").replace(/^\s*·\s*/, ""), event.location || event.community].filter(Boolean).join(" · ") || "Details on the event calendar"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/30 p-4 text-sm text-stone-200 sm:rounded-2xl sm:p-5">No upcoming events have been published yet. Have one to share? Add it for review.</div>
        )}

        <Link href="/submit-event" className="justify-self-start text-sm font-bold text-white underline decoration-red-300 underline-offset-4 sm:hidden">Add an event</Link>
      </div>
    </section>
  )
}
