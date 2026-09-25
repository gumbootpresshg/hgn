export const EVENT_FIELDS = "id,title,description,category,event_date,start_date,end_date,start_time,end_time,is_all_day,location,community,town,organizer_name,organizer_email,organizer_phone,contact_name,contact_email,contact_phone,image_url,website,status,source,published_at,created_at,updated_at"

function text(value: unknown, max = 2000) {
  const valueText = String(value || "").trim().slice(0, max)
  return valueText || null
}

function date(value: unknown) {
  const valueText = String(value || "").trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(valueText) ? valueText : null
}

function time(value: unknown) {
  const valueText = String(value || "").trim()
  return /^\d{2}:\d{2}(:\d{2})?$/.test(valueText) ? valueText : null
}

function url(value: unknown) {
  const valueText = text(value, 1200)
  if (!valueText) return null
  try {
    const parsed = new URL(valueText)
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

export function eventPayload(body: any) {
  const startDate = date(body.start_date || body.event_date)
  const endDate = date(body.end_date) || startDate
  const status = ["draft", "published", "archived"].includes(String(body.status || "").toLowerCase())
    ? String(body.status).toLowerCase()
    : "draft"

  if (!text(body.title, 220)) return { error: "Event title is required." } as const
  if (!startDate) return { error: "A valid start date is required." } as const
  if (endDate && endDate < startDate) return { error: "The end date cannot be before the start date." } as const

  const allDay = body.is_all_day === true
  return {
    row: {
      title: text(body.title, 220),
      description: text(body.description, 12000),
      category: text(body.category, 100),
      event_date: startDate,
      start_date: startDate,
      end_date: endDate,
      start_time: allDay ? null : time(body.start_time),
      end_time: allDay ? null : time(body.end_time),
      is_all_day: allDay,
      location: text(body.location, 300),
      community: text(body.community, 120),
      town: text(body.community || body.town, 120),
      organizer_name: text(body.organizer_name, 200),
      organizer_email: text(body.organizer_email, 320),
      organizer_phone: text(body.organizer_phone, 80),
      contact_name: text(body.organizer_name, 200),
      contact_email: text(body.organizer_email, 320),
      contact_phone: text(body.organizer_phone, 80),
      image_url: url(body.image_url),
      website: url(body.website),
      status,
      source: "editor",
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
  } as const
}
