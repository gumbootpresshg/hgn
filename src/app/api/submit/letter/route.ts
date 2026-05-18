import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 })
  }

  if (body.website || body.company) {
    return NextResponse.json({ ok: true })
  }

  const name = String(body.name || body.sender_name || "").trim()
  const email = String(body.email || body.sender_email || "").trim()
  const community = String(body.community || body.location || "").trim()
  const subject = String(body.subject || body.title || "Letter to the Editor").trim()
  const message = String(body.message || body.body || body.letter || "").trim()
  const phone = String(body.phone || body.sender_phone || "").trim()

  if (!name || !email || !community || !message) {
    return NextResponse.json(
      { error: "Name, email, community, and letter are required." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase.rpc("submit_letter_to_editor", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_community: community,
    p_subject: subject,
    p_message: message,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data || null })
}
