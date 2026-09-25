import { NextRequest, NextResponse } from "next/server"
import { EVENT_FIELDS, eventPayload } from "@/lib/admin-event-payload"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [events, submissions] = await Promise.all([
    auth.db.from("events").select(EVENT_FIELDS).order("start_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(400),
    auth.db.from("event_submissions").select("id,title,description,event_date,start_date,end_date,start_time,end_time,is_all_day,location,community,organizer_name,organizer_email,organizer_phone,contact_name,contact_email,contact_phone,image_url,status,published_event_id,created_at,updated_at").order("created_at", { ascending: false }).limit(250),
  ])
  if (events.error) return NextResponse.json({ error: events.error.message }, { status: 500 })
  if (submissions.error) return NextResponse.json({ error: submissions.error.message }, { status: 500 })
  return NextResponse.json({ events: events.data || [], submissions: submissions.data || [] }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const payload = eventPayload(body)
  if ("error" in payload) return NextResponse.json({ error: payload.error }, { status: 400 })
  const { data, error } = await auth.db.from("events").insert(payload.row).select(EVENT_FIELDS).single()
  if (error) return NextResponse.json({ error: `Event could not be created: ${error.message}` }, { status: 500 })
  return NextResponse.json({ event: data }, { status: 201 })
}
