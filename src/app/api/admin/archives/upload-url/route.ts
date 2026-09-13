import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"

export const runtime = "nodejs"

const PDF_MAX = 120 * 1024 * 1024
const COVER_MAX = 20 * 1024 * 1024

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "") || "file"
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => null)
  const kind = body?.kind === "cover" ? "cover" : body?.kind === "pdf" ? "pdf" : null
  const filename = String(body?.filename || "").trim()
  const contentType = String(body?.contentType || "").trim()
  const issueDate = String(body?.issueDate || "").trim()
  const size = Number(body?.size || 0)

  if (!kind || !filename || !issueDate || !Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "File details are incomplete." }, { status: 400 })
  }

  if (kind === "pdf") {
    if (contentType !== "application/pdf" && !filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Edition file must be a PDF." }, { status: 400 })
    }
    if (size > PDF_MAX) return NextResponse.json({ error: "PDF must be under 120 MB." }, { status: 400 })
  } else {
    if (!contentType.startsWith("image/")) return NextResponse.json({ error: "Cover must be an image." }, { status: 400 })
    if (size > COVER_MAX) return NextResponse.json({ error: "Cover image must be under 20 MB." }, { status: 400 })
  }

  const stamp = Date.now()
  const folder = kind === "pdf" ? "archives" : "archives/covers"
  const path = `${folder}/${issueDate}-${stamp}-${safeName(filename)}`
  const { data, error } = await auth.db.storage.from("hgn-media").createSignedUploadUrl(path, { upsert: false })
  if (error || !data?.token) {
    return NextResponse.json({ error: error?.message || "Could not prepare the upload." }, { status: 500 })
  }

  return NextResponse.json({
    bucket: "hgn-media",
    path,
    token: data.token,
    publicUrl: auth.db.storage.from("hgn-media").getPublicUrl(path).data.publicUrl,
    maxBytes: kind === "pdf" ? PDF_MAX : COVER_MAX,
  })
}
