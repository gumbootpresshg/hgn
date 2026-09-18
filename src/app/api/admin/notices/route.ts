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

export async function GET(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { data, error } = await auth.db.from("notices").select("*").order("created_at", { ascending: false }).limit(300)
  if (error) return NextResponse.json({ error: `Notice could not be saved: ${error.message}` }, { status: 500 })
  return NextResponse.json({ notices: data || [] })
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const title = clean(body.title, 220)
  const details = clean(body.body || body.message, 12000)
  if (!title || !details) return NextResponse.json({ error: "Title and notice text are required." }, { status: 400 })
  const status = body.status === "published" ? "published" : "draft"
  const row = {
    title,
    body: details,
    message: details,
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
    source: "staff",
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
    requires_approval: false,
  }
  const { data, error } = await auth.db.from("notices").insert(row).select().single()
  if (error) return NextResponse.json({ error: `Notice could not be saved: ${error.message}` }, { status: 500 })
  return NextResponse.json({ notice: data })
}
