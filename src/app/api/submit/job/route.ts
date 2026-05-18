import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid job post." }, { status: 400 })
  }

  const jobTitle = String(body.job_title || body.title || "").trim()
  const description = String(body.description || "").trim()

  if (!jobTitle || !description) {
    return NextResponse.json({ error: "Job title and description are required." }, { status: 400 })
  }

  const result = await supabase.from("job_submissions").insert({
    job_title: jobTitle,
    employer: body.employer || null,
    location: body.location || null,
    job_type: body.job_type || null,
    pay_range: body.pay_range || null,
    description,
    how_to_apply: body.how_to_apply || null,
    contact_name: body.contact_name || body.name || null,
    contact_email: body.contact_email || body.email || null,
    contact_phone: body.contact_phone || body.phone || null,
    status: "pending",
  })

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
