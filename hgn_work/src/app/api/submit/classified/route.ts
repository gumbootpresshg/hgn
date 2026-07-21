import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid classified." }, { status: 400 })
  }

  if (body.website || body.company) {
    return NextResponse.json({ ok: true })
  }

  const title = String(body.title || body.item_title || body.name_of_item || "").trim()
  const description = String(body.description || body.body || body.details || "").trim()

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 })
  }

  const classifiedPayload = {
    title,
    description,
    category: body.category || "marketplace",
    price: body.price || null,
    location: body.location || null,
    seller_name: body.seller_name || body.name || body.contact_name || null,
    seller_email: body.seller_email || body.email || body.contact_email || null,
    seller_phone: body.seller_phone || body.phone || body.contact_phone || null,
    image_url: body.image_url || body.photo_url || null,
    status: "pending",
  }

  const [classifiedResult, inboxResult] = await Promise.all([
    supabase.from("classified_submissions").insert(classifiedPayload),
    supabase.from("submission_inbox").insert({
      submission_type: "classified",
      title,
      sender_name: classifiedPayload.seller_name,
      sender_email: classifiedPayload.seller_email,
      sender_phone: classifiedPayload.seller_phone,
      message: description,
      payload: {
        ...body,
        category: classifiedPayload.category,
        price: classifiedPayload.price,
        location: classifiedPayload.location,
        image_url: classifiedPayload.image_url,
      },
      status: "pending",
      priority: "normal",
    }),
  ])

  if (classifiedResult.error || inboxResult.error) {
    return NextResponse.json(
      {
        error:
          classifiedResult.error?.message ||
          inboxResult.error?.message ||
          "Classified submission failed.",
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
