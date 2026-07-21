import { eventStartDateValue } from "@/lib/events"
import { isActualPublishedEvent } from "@/lib/event-format"

function normalizePublicEvent(event: any, source: string) {
  const startDate = event?.start_date || event?.event_date || (typeof event?.starts_at === "string" ? event.starts_at.slice(0, 10) : null)
  const endDate = event?.end_date || (typeof event?.ends_at === "string" ? event.ends_at.slice(0, 10) : null) || startDate

  return {
    ...event,
    start_date: startDate,
    event_date: event?.event_date || startDate,
    end_date: endDate,
    start_time: event?.is_all_day ? null : event?.start_time || event?.event_time || null,
    end_time: event?.is_all_day ? null : event?.end_time || null,
    community: event?.community || event?.town || null,
    organizer_name: event?.organizer_name || event?.organizer || event?.contact_name || null,
    organizer_email: event?.organizer_email || event?.contact_email || null,
    organizer_phone: event?.organizer_phone || event?.contact_phone || null,
    _public_source: source,
  }
}

export async function fetchPublicEvents(supabase: any) {
  // Admin Events is the source of truth. Public pages should only show approved
  // event_submissions so old rows from the legacy events table cannot reappear.
  const submissionResult = await supabase
    .from("event_submissions")
    .select("id,title,description,event_date,start_date,end_date,start_time,end_time,is_all_day,location,community,organizer_name,organizer_email,organizer_phone,contact_name,contact_email,contact_phone,image_url,status,updated_at,created_at,published_event_id")
    .in("status", ["approved", "published", "public", "live"])
    .order("start_date", { ascending: true, nullsFirst: false })
    .order("event_date", { ascending: true, nullsFirst: false })

  const events = (submissionResult.data || [])
    .filter(isActualPublishedEvent)
    .map((event: any) => normalizePublicEvent(event, "event_submissions"))
    .filter((event: any) => eventStartDateValue(event))

  return {
    data: events,
    error: submissionResult.error,
  }
}
