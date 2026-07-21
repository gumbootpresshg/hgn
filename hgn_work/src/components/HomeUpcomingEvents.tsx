import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvents } from "@/lib/public-events"
import { formatEventDateOnly } from "@/lib/event-format"

function eventDateValue(event: any) {
  return event?.start_date || event?.event_date || event?.date || event?.starts_at || event?.created_at || ""
}

export default async function HomeUpcomingEvents() {
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await fetchPublicEvents(supabase)

  const events = (data || [])
    .filter((event: any) => {
      const title = String(event.title || "").toLowerCase()
      const date = String(eventDateValue(event) || "").slice(0, 10)

      return (
        date >= today &&
        !title.includes("submit your") &&
        !title.includes("community event submissions") &&
        !title.includes("submissions open") &&
        !title.includes("submit event")
      )
    })
    .sort((a: any, b: any) => String(eventDateValue(a)).localeCompare(String(eventDateValue(b))))
    .slice(0, 5)

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">Upcoming Events</h2>
        <Link href="/events" className="text-xs font-black uppercase tracking-wide text-hgnBlue">
          View all
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No upcoming events are published yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event: any) => (
            <Link key={event.id} href="/events" className="block rounded-2xl border p-4 hover:border-hgnBlue">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-hgnBlue">
                {formatEventDateOnly(event)}
              </p>
              <h3 className="mt-2 text-base font-black">{event.title}</h3>
              {event.location || event.community ? (
                <p className="mt-1 text-xs text-slate-500">
                  {[event.location, event.community].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
