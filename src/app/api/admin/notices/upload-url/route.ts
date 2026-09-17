import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

const PDF_MAX = 40 * 1024 * 1024
const IMAGE_MAX = 20 * 1024 * 1024
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "") || "notice-file"
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => null)
  const filename = String(body?.filename || "").trim()
  const contentType = String(body?.contentType || "").trim().toLowerCase()
  const size = Number(body?.size || 0)

  if (!filename || !Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "File details are incomplete." }, { status: 400 })
  }

  const isPdf = contentType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")
  const isImage = IMAGE_TYPES.has(contentType)
  if (!isPdf && !isImage) {
    return NextResponse.json({ error: "Notice files must be PDF, JPG, PNG, WebP or GIF." }, { status: 400 })
  }
  if (isPdf && size > PDF_MAX) return NextResponse.json({ error: "Notice PDF must be under 40 MB." }, { status: 400 })
  if (isImage && size > IMAGE_MAX) return NextResponse.json({ error: "Notice image must be under 20 MB." }, { status: 400 })

  const path = `notices/${new Date().getUTCFullYear()}/${Date.now()}-${safeName(filename)}`
  const { data, error } = await auth.db.storage.from("hgn-notices").createSignedUploadUrl(path, { upsert: false })
  if (error || !data?.token) {
    return NextResponse.json({ error: error?.message || "Could not prepare the notice upload." }, { status: 500 })
  }

  return NextResponse.json({
    bucket: "hgn-notices",
    path,
    token: data.token,
    publicUrl: auth.db.storage.from("hgn-notices").getPublicUrl(path).data.publicUrl,
  })
}
