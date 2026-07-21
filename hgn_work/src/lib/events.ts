export function eventDateValue(event: any) {
  return event.event_date || event.date || event.start_date || event.starts_at || event.start_time
}

export function eventDayKey(event: any) {
  const value = eventDateValue(event)
  if (!value) return ""

  if (typeof value === "string") {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    if (dateOnly) return dateOnly
  }

  return new Date(value).toISOString().slice(0, 10)
}

function safeDateForDisplay(value: any) {
  if (typeof value === "string") {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}$/)?.[0]
    if (dateOnly) return new Date(`${dateOnly}T12:00:00Z`)
  }

  return new Date(value)
}

export function formatEventDate(value: any) {
  if (!value) return "Date TBA"
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  }).format(safeDateForDisplay(value))
}

export function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function buildCalendarDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1))
  const last = new Date(Date.UTC(year, month + 1, 0))
  const firstWeekday = first.getUTCDay()
  const daysInMonth = last.getUTCDate()
  const cells: Array<{ date: Date | null; key: string }> = []

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ date: null, key: `blank-start-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month, day))
    cells.push({ date, key: date.toISOString().slice(0, 10) })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `blank-end-${cells.length}` })
  }

  return cells
}


export function eventStartDateValue(event: any) {
  return event?.start_date || event?.event_date || event?.date || event?.starts_at
}

export function eventEndDateValue(event: any) {
  return event?.end_date || eventStartDateValue(event)
}

export function dateOnly(value: any) {
  if (!value) return ""
  if (typeof value === "string") {
    const matched = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    if (matched) return matched
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export function eventOverlapsRange(event: any, rangeStart: string, rangeEndExclusive: string) {
  const start = dateOnly(eventStartDateValue(event))
  const end = dateOnly(eventEndDateValue(event)) || start
  if (!start) return false
  return start < rangeEndExclusive && end >= rangeStart
}

export function eventDayKeysInRange(event: any, rangeStart: string, rangeEndExclusive: string) {
  const startKey = dateOnly(eventStartDateValue(event))
  const endKey = dateOnly(eventEndDateValue(event)) || startKey
  if (!startKey) return []
  const keys: string[] = []
  const cursor = new Date(`${startKey}T00:00:00Z`)
  const end = new Date(`${endKey}T00:00:00Z`)
  const rangeStartDate = new Date(`${rangeStart}T00:00:00Z`)
  const rangeEndDate = new Date(`${rangeEndExclusive}T00:00:00Z`)
  while (cursor <= end) {
    if (cursor >= rangeStartDate && cursor < rangeEndDate) keys.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return keys
}

export function formatEventDateRange(event: any) {
  const start = dateOnly(eventStartDateValue(event))
  const end = dateOnly(eventEndDateValue(event))
  if (!start) return "Date TBA"
  if (!end || end === start) return formatEventDate(start)
  return `${formatEventDate(start)} to ${formatEventDate(end)}`
}
