import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
function part(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo" }

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({})); const type = String(body.contentType || "").toLowerCase(); const size = Number(body.size || 0)
  if (!allowed.has(type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 400 })
  if (!Number.isFinite(size) || size < 1 || size > 15 * 1024 * 1024) return NextResponse.json({ error: "Images must be under 15MB." }, { status: 400 })
  const extension = type === "image/jpeg" ? "jpg" : type.split("/")[1]
  const path = `island-lens/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${part(String(body.filename || "photo")).slice(0, 70)}.${extension}`
  const { data, error } = await auth.db.storage.from("hgn-media").createSignedUploadUrl(path)
  if (error || !data) return NextResponse.json({ error: error?.message || "Could not prepare image upload." }, { status: 500 })
  return NextResponse.json({ bucket: "hgn-media", path, token: data.token, publicUrl: auth.db.storage.from("hgn-media").getPublicUrl(path).data.publicUrl })
}
