import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const type = String(body.contentType || "").toLowerCase()
  const size = Number(body.size || 0)
  if (!allowed.has(type) || !size || size > 10 * 1024 * 1024) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF under 10 MB." }, { status: 400 })
  const name = String(body.filename || "event-image").toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-120)
  const path = `events/editor/${new Date().getUTCFullYear()}/${Date.now()}-${name}`
  const { data, error } = await auth.db.storage.from("hgn-media").createSignedUploadUrl(path, { upsert: false })
  if (error || !data?.token) return NextResponse.json({ error: error?.message || "Could not prepare image upload." }, { status: 500 })
  return NextResponse.json({ bucket: "hgn-media", path, token: data.token, publicUrl: auth.db.storage.from("hgn-media").getPublicUrl(path).data.publicUrl })
}
