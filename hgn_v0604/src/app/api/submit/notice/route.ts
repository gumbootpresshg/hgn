import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { notifyHgnOperations } from "@/lib/hgn-operations-notify"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 })
  }

  const title = String(body.title || "Public notice").trim()
  const message = String(body.message || body.body || body.description || "").trim()

  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required." }, { status: 400 })
  }

  const [noticeResult, inboxResult] = await Promise.all([
    supabase.from("notices").insert({
      title,
      body: message,
      contact_name: body.name || body.contact_name || null,
      contact_email: body.email || body.contact_email || null,
      contact_phone: body.phone || body.contact_phone || null,
      category: body.category || "notice",
      status: "pending",
      monthly_rate_cad: 100,
      payment_status: "unpaid",
      requires_approval: true,
      source: "website",
    }),
    supabase.from("submission_inbox").insert({
      submission_type: "notice",
      title,
      sender_name: body.name || body.contact_name || null,
      sender_email: body.email || body.contact_email || null,
      sender_phone: body.phone || body.contact_phone || null,
      message,
      payload: body,
      status: "pending",
      priority: "normal",
    }),
  ])

  if (noticeResult.error || inboxResult.error) {
    return NextResponse.json(
      { error: noticeResult.error?.message || inboxResult.error?.message || "Submission failed." },
      { status: 500 }
    )
  }

  await notifyHgnOperations({
    submissionType: "notice",
    sourceId: String(crypto.randomUUID()),
    title: String(title || ""),
    submitterName: body.name || body.contact_name ? String(body.name || body.contact_name) : null,
    submitterEmail: body.email || body.contact_email ? String(body.email || body.contact_email) : null,
    publicAdminUrl: "/admin/notices",
  })

  return NextResponse.json({ ok: true })
}
