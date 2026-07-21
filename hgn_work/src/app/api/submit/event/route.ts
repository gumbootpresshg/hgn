import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid event submission." }, { status: 400 })
  }

  if (body.website || body.company) {
    return NextResponse.json({ ok: true })
  }

  const title = String(body.title || body.event_title || "").trim()
  const description = String(body.description || body.details || "").trim()
  const location = String(body.location || "").trim()
  const community = String(body.community || "").trim()
  const eventDate = String(body.event_date || body.date || "").trim()

  if (!title || !description || !location || !community || !eventDate) {
    return NextResponse.json(
      { error: "Event title, description, location, community, and date are required." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase.rpc("submit_community_event", {
    p_title: title,
    p_description: description,
    p_event_date: eventDate,
    p_start_time: body.start_time || null,
    p_end_time: body.end_time || null,
    p_location: location,
    p_community: community,
    p_organizer_name: body.organizer_name || body.name || null,
    p_organizer_email: body.organizer_email || body.email || null,
    p_organizer_phone: body.organizer_phone || body.phone || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data || null })
}
