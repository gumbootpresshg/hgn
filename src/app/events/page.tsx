import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvents } from "@/lib/public-events"
import { buildCalendarDays, eventDayKeysInRange, eventOverlapsRange, formatEventDateRange, formatMonthTitle } from "@/lib/events"

export const revalidate = 60

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; community?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const selectedMonth = params?.month ? new Date(`${params.month}-01T00:00:00Z`) : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  const year = selectedMonth.getUTCFullYear()
  const month = selectedMonth.getUTCMonth()
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`

  const start = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  const end = new Date(Date.UTC(year, month + 1, 1)).toISOString().slice(0, 10)

  const { data, error } = await fetchPublicEvents(supabase)

  const allEvents = (data || [])
    .filter((event: any) => eventOverlapsRange(event, start, end))
    .sort((a: any, b: any) => {
      const aDate = String(a.start_date || a.event_date || "")
      const bDate = String(b.start_date || b.event_date || "")
      const dateCompare = aDate.localeCompare(bDate)
      if (dateCompare !== 0) return dateCompare
      return String(a.start_time || "").localeCompare(String(b.start_time || ""))
    })
  const communities = Array.from(new Set(allEvents.map((event: any) => event.community).filter(Boolean))).sort()
  const selectedCommunity = params?.community || ""

  const events = selectedCommunity
    ? allEvents.filter((event: any) => String(event.community || "") === selectedCommunity)
    : allEvents

  const eventsByDay = events.reduce((acc: Record<string, any[]>, event: any) => {
    for (const key of eventDayKeysInRange(event, start, end)) {
      acc[key] = acc[key] || []
      acc[key].push(event)
    }
    return acc
  }, {})

  const calendarDays = buildCalendarDays(year, month)
  const previous = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 7)
  const next = new Date(Date.UTC(year, month + 1, 1)).toISOString().slice(0, 7)

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Community Calendar</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight">Events</h1>
            <p className="mt-4 max-w-3xl text-slate-600">
              What’s happening across Haida Gwaii: meetings, markets, sports, community events and important dates.
            </p>
          </div>

          <Link href="/submit-event" className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-bold text-white">
            Submit Event
          </Link>
        </div>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Calendar</p>
              <h2 className="text-3xl font-black">{formatMonthTitle(selectedMonth)}</h2>
            </div>
            <div className="flex gap-2">
              <Link href={`/events?month=${previous}${selectedCommunity ? `&community=${encodeURIComponent(selectedCommunity)}` : ""}`} className="rounded-full border px-4 py-2 text-sm font-bold">← Previous</Link>
              <Link href={`/events?month=${next}${selectedCommunity ? `&community=${encodeURIComponent(selectedCommunity)}` : ""}`} className="rounded-full border px-4 py-2 text-sm font-bold">Next →</Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wide text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((cell) => {
              const dayEvents = cell.date ? eventsByDay[cell.key] || [] : []
              return (
                <div key={cell.key} className={["min-h-28 rounded-2xl border p-2", cell.date ? "bg-white" : "bg-slate-50"].join(" ")}>
                  {cell.date ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">{cell.date.getUTCDate()}</span>
                        {dayEvents.length > 0 ? <span className="rounded-full bg-hgnBlue px-2 py-0.5 text-[10px] font-black text-white">{dayEvents.length}</span> : null}
                      </div>
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 3).map((event: any) => (
                          <a key={event.id} href={`#event-${event.id}`} className="block truncate rounded-lg bg-slate-100 px-2 py-1 text-left text-[11px] font-bold hover:text-hgnBlue">
                            {event.is_all_day ? "All day · " : event.start_time ? `${event.start_time} · ` : ""}{event.title}
                          </a>
                        ))}
                        {dayEvents.length > 3 ? <p className="text-[11px] font-bold text-slate-400">+{dayEvents.length - 3} more</p> : null}
                      </div>
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Filters</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/events?month=${monthKey}`} className={["rounded-full px-4 py-2 text-sm font-bold", selectedCommunity ? "border" : "bg-slate-950 text-white"].join(" ")}>All communities</Link>
              {communities.map((community: any) => (
                <Link key={community} href={`/events?month=${monthKey}&community=${encodeURIComponent(community)}`} className={["rounded-full px-4 py-2 text-sm font-bold", selectedCommunity === community ? "bg-slate-950 text-white" : "border"].join(" ")}>
                  {community}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">HGN Events</p>
            <h2 className="mt-2 text-2xl font-black">Got an event?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Submit community events for editor review. Approved events appear on the calendar and list.
            </p>
            <Link href="/submit-event" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950">
              Submit Event
            </Link>
          </section>
        </aside>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Event List</p>
            <h2 className="text-3xl font-black">{events.length} event{events.length === 1 ? "" : "s"} this month</h2>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="rounded-2xl border bg-white p-6 text-slate-600">No events found for this month.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event: any) => (
              <article id={`event-${event.id}`} key={event.id} className="scroll-mt-28 rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-hgnBlue/10 px-3 py-1 text-xs font-black text-hgnBlue">{formatEventDateRange(event)}</span>
                  {event.community ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{event.community}</span> : null}
                  {event.category ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{event.category}</span> : null}
                </div>

                {event.image_url ? <img src={event.image_url} alt="" className="mt-4 h-48 w-full rounded-2xl object-cover" /> : null}
                <h3 className="mt-4 text-2xl font-black">{event.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {[event.is_all_day ? "All day" : event.start_time, !event.is_all_day && event.end_time ? `to ${event.end_time}` : null, event.location].filter(Boolean).join(" · ")}
                </p>
                {event.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{event.description}</p> : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  {event.website ? <a href={event.website} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide">Website</a> : null}
                  {event.contact_email ? <a href={`mailto:${event.contact_email}`} className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide">Contact</a> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
