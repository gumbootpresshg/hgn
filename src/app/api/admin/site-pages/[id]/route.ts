import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const { data, error } = await auth.db.from("hgn_site_pages").select("*").eq("id", id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Page not found." }, { status: 404 })
  return NextResponse.json({ page: data })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const body = await req.json()
  const slug = String(body.slug || body.title || "page").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const patch = {
    slug,
    title: String(body.title || "Untitled page").trim(),
    eyebrow: String(body.eyebrow || "").trim() || null,
    description: String(body.description || "").trim() || null,
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
    status: body.status === "published" ? "published" : "draft",
    visibility: ["public","logged_in","members","staff","disabled"].includes(body.visibility) ? body.visibility : "public",
    seo_title: String(body.seo_title || "").trim() || null,
    seo_description: String(body.seo_description || "").trim() || null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await auth.db.from("hgn_site_pages").update(patch).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const { data: existing } = await auth.db.from("hgn_site_pages").select("system_key").eq("id", id).maybeSingle()
  if (existing?.system_key) return NextResponse.json({ error: "Built-in pages can be hidden or edited, but not deleted." }, { status: 400 })
  const { error } = await auth.db.from("hgn_site_pages").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
