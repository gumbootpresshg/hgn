function safeEventDateForDisplay(value: any) {
  if (typeof value === "string") {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}$/)?.[0]
    if (dateOnly) return new Date(`${dateOnly}T12:00:00Z`)
  }

  return new Date(value)
}

export function formatEventDateOnly(event: any) {
  const value = event?.start_date || event?.event_date || event?.date || event?.starts_at || event?.created_at
  if (!value) return "Date TBA"
  const date = safeEventDateForDisplay(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Vancouver",
  }).format(date)
}

export function formatEventDateTime(event: any) {
  const date = formatEventDateOnly(event)
  if (event?.is_all_day) return `${date} · All day`
  const start = event?.start_time || event?.time
  const end = event?.end_time
  if (start && end) return `${date} · ${start}–${end}`
  if (start) return `${date} · ${start}`
  return date
}

export function isActualPublishedEvent(event: any) {
  const status = String(event?.status || "").toLowerCase()
  const title = String(event?.title || "").toLowerCase()
  const approved = ["published", "approved", "active", "live", "public"].includes(status)
  const notPrompt =
    !title.includes("submit your") &&
    !title.includes("community event submissions open") &&
    !title.includes("submit event") &&
    !title.includes("event submissions")
  return approved && notPrompt
}
