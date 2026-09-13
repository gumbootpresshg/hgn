import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { data, error } = await auth.db.from("hgn_site_pages").select("*").order("title", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pages: data || [] })
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json()
  const slug = String(body.slug || body.title || "page").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const row = {
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
  const { data, error } = await auth.db.from("hgn_site_pages").insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data })
}
