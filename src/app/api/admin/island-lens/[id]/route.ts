import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"
import { lensSlug } from "@/lib/island-lens"

const fields = "id,slug,title,description,gallery_intro,gallery_body,media_type,thumbnail_url,community,credit,status,featured,event_date,issue_label,issue_url,cover_caption,photo_urls,photo_captions,video_urls,published_at,created_at,updated_at"
const text = (value: unknown, maximum = 5000) => String(value || "").trim().slice(0, maximum)
const photos = (value: unknown) => Array.isArray(value) ? value.filter((item:any) => item && typeof item.url === "string" && item.url.startsWith("http")).slice(0, 80).map((item:any) => ({ url: text(item.url, 1200), caption: text(item.caption, 500), credit: text(item.credit, 200), alt: text(item.alt, 300) })) : []

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params; const body = await req.json().catch(() => ({})); const title = text(body.title, 180)
  if (!title) return NextResponse.json({ error: "A photo feature needs a title." }, { status: 400 })
  const photo_captions = photos(body.photo_captions); const status = ["draft", "published", "archived"].includes(body.status) ? body.status : "draft"
  const row:any = { title, slug: lensSlug(body.slug || title), description: text(body.description, 600), gallery_intro: text(body.gallery_intro, 1200), gallery_body: text(body.gallery_body, 12000), media_type: "gallery", thumbnail_url: photo_captions[0]?.url || null, community: text(body.community, 100), credit: text(body.credit, 200), status, featured: Boolean(body.featured), event_date: body.event_date || null, issue_label: text(body.issue_label, 120), issue_url: text(body.issue_url, 1200), cover_caption: text(body.cover_caption, 500), photo_captions, photo_urls: photo_captions.map((photo) => photo.url), updated_at: new Date().toISOString() }
  if (status === "published" && !body.published_at) row.published_at = new Date().toISOString()
  const { data, error } = await auth.db.from("island_lens_items").update(row).eq("id", id).select(fields).maybeSingle()
  if (error) return NextResponse.json({ error: error.message.includes("slug") ? "That photo-feature URL is already in use." : error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Photo feature not found." }, { status: 404 })
  return NextResponse.json({ item: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePublisher(req); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params; const { error } = await auth.db.from("island_lens_items").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
