import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvents } from "@/lib/public-events"
import { formatEventDateOnly } from "@/lib/event-format"

function eventDateValue(event: any) { return event?.start_date || event?.event_date || event?.date || event?.starts_at || event?.created_at || "" }

export default async function HomeUpcomingEvents() {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await fetchPublicEvents(supabase)
  const events = (data || []).filter((event: any) => {
    const title = String(event.title || "").toLowerCase()
    const date = String(eventDateValue(event) || "").slice(0, 10)
    return date >= today && !title.includes("submit your") && !title.includes("community event submissions") && !title.includes("submissions open") && !title.includes("submit event")
  }).sort((a: any, b: any) => String(eventDateValue(a)).localeCompare(String(eventDateValue(b)))).slice(0, 4)

  return (
    <section>
      <div className="newspaper-section-heading"><h2>Upcoming Events</h2><Link href="/events">Calendar →</Link></div>
      {events.length === 0 ? <p className="py-5 text-sm text-stone-600">No upcoming events are published yet.</p> : (
        <div>
          {events.map((event: any) => (
            <Link key={event.id} href="/events" className="grid grid-cols-[72px_1fr] gap-4 border-b border-stone-300 py-4">
              <p className="font-serif text-sm font-bold uppercase leading-5 text-hgnRed">{formatEventDateOnly(event)}</p>
              <div><h3 className="font-serif text-lg font-bold leading-tight hover:text-hgnRed">{event.title}</h3>{event.location || event.community ? <p className="mt-1 text-xs text-stone-500">{[event.location, event.community].filter(Boolean).join(" · ")}</p> : null}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
