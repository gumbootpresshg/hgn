import { NextRequest, NextResponse } from "next/server"
import { EVENT_FIELDS, eventPayload } from "@/lib/admin-event-payload"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const { data, error } = await auth.db.from("events").select(EVENT_FIELDS).eq("id", id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Event not found." }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const payload = eventPayload(body)
  if ("error" in payload) return NextResponse.json({ error: payload.error }, { status: 400 })
  const { data, error } = await auth.db.from("events").update(payload.row).eq("id", id).select(EVENT_FIELDS).maybeSingle()
  if (error) return NextResponse.json({ error: `Event could not be saved: ${error.message}` }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Event not found." }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const { error } = await auth.db.from("events").delete().eq("id", id)
  if (error) return NextResponse.json({ error: `Event could not be deleted: ${error.message}` }, { status: 500 })
  return NextResponse.json({ ok: true })
}
