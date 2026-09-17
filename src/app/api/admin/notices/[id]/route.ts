import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

function clean(value: unknown, max = 1000) {
  const text = String(value || "").trim().slice(0, max)
  return text || null
}
function iso(value: unknown) {
  const text = String(value || "").trim()
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))
  const status = ["draft", "pending", "published", "archived"].includes(String(body.status)) ? String(body.status) : "draft"
  const update = {
    title: clean(body.title, 220),
    body: clean(body.body || body.message, 12000),
    message: clean(body.body || body.message, 12000),
    type: clean(body.type || body.category, 80),
    category: clean(body.category || body.type, 80) || "notice",
    town: clean(body.town, 120),
    organization: clean(body.organization, 180),
    starts_at: iso(body.starts_at),
    expires_at: iso(body.expires_at),
    link_url: clean(body.link_url, 1000),
    attachment_url: clean(body.attachment_url, 1000),
    featured: body.featured === true,
    status,
    published_at: status === "published" ? (body.published_at || new Date().toISOString()) : body.published_at || null,
    updated_at: new Date().toISOString(),
  }
  if (!update.title || !update.body) return NextResponse.json({ error: "Title and notice text are required." }, { status: 400 })
  const { data, error } = await auth.db.from("notices").update(update).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notice: data })
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await context.params
  const { error } = await auth.db.from("notices").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
