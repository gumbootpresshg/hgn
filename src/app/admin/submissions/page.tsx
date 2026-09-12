"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type AnyItem = Record<string, any>

type QueueItem = AnyItem & {
  _table: string
  _kind: "submission" | "classified" | "job"
  _submissionType: string
  _sourceLabel: string
  _workspaceHref: string
  _canModerateHere?: boolean
}

type SourceSpec = {
  table: string
  submissionType: string
  sourceLabel: string
  workspaceHref: (row: AnyItem) => string
  normalize: (row: AnyItem) => Partial<QueueItem>
  kind?: QueueItem["_kind"]
  canModerateHere?: boolean
}

const SOURCES: SourceSpec[] = [
  {
    table: "letters_to_editor",
    submissionType: "letter",
    sourceLabel: "Letters to the Editor",
    workspaceHref: () => "/admin/letters",
    normalize: (r) => ({ title: "Letter to the Editor", sender_name: r.name, sender_email: r.email, message: r.letter, status: r.status || "new" }),
  },
  {
    table: "event_submissions",
    submissionType: "event",
    sourceLabel: "Events",
    workspaceHref: (r) => r.id ? `/admin/events/${r.id}` : "/admin/events",
    normalize: (r) => ({ title: r.title || "Event submission", sender_name: r.organizer_name, sender_email: r.organizer_email, message: r.description, status: r.status || "pending" }),
  },
  {
    table: "story_tips",
    submissionType: "story_tip",
    sourceLabel: "Story Tips",
    workspaceHref: () => "/admin/submissions",
    normalize: (r) => ({ title: r.title || "Story tip", sender_name: r.name, sender_email: r.email, message: r.details, status: r.status || "new" }),
    canModerateHere: true,
  },
  {
    table: "correction_requests",
    submissionType: "correction",
    sourceLabel: "Corrections",
    workspaceHref: () => "/admin/trust",
    normalize: (r) => ({ title: r.story_url || r.article_url || r.article_title || "Correction request", sender_name: r.name || r.submitter_name, sender_email: r.email || r.submitter_email, message: r.details || r.message, status: r.status || "new" }),
  },
  {
    table: "photo_submissions",
    submissionType: "photo",
    sourceLabel: "Reader Photos",
    workspaceHref: () => "/admin/island-lens",
    normalize: (r) => ({ title: r.caption || "Reader photo", sender_name: r.name, sender_email: r.email, message: r.caption, status: r.status || "new" }),
    canModerateHere: true,
  },
  {
    table: "notices",
    submissionType: "notice",
    sourceLabel: "Community Notices",
    workspaceHref: () => "/admin/submissions",
    normalize: (r) => ({ title: r.title || "Community notice", sender_name: r.contact_name, sender_email: r.contact_email, message: r.body || r.message || r.details || r.notice, status: r.status || "pending" }),
    canModerateHere: true,
  },
  {
    table: "obituaries",
    submissionType: "obituary",
    sourceLabel: "Obituaries",
    workspaceHref: () => "/admin/obituaries",
    normalize: (r) => ({ title: r.name || r.title || "Obituary submission", sender_name: r.contact_name, sender_email: r.contact_email, message: r.details || r.notice || r.message, status: r.status || "pending" }),
  },
  {
    table: "visitor_listings",
    submissionType: "visitor_listing",
    sourceLabel: "Visitor Guide",
    workspaceHref: () => "/admin/visitor-guide",
    normalize: (r) => ({ title: r.title || "Visitor Guide submission", sender_name: r.submitter_name, sender_email: r.submitter_email, message: r.description, status: r.status || "pending" }),
  },
  {
    table: "live_map_items",
    submissionType: "live_map",
    sourceLabel: "Live Map",
    workspaceHref: () => "/admin/live-map",
    normalize: (r) => ({ title: r.title || "Live Map submission", sender_name: r.contact_name, sender_email: r.contact_email, message: r.details, status: r.status || "pending" }),
  },
  {
    table: "classified_submissions",
    submissionType: "classified",
    sourceLabel: "Marketplace / Classifieds",
    workspaceHref: () => "/admin/marketplace",
    normalize: normalizeMarketplaceItem,
    kind: "classified",
    canModerateHere: true,
  },
  {
    table: "classifieds",
    submissionType: "classified",
    sourceLabel: "Marketplace / Classifieds",
    workspaceHref: () => "/admin/marketplace",
    normalize: normalizeMarketplaceItem,
    kind: "classified",
    canModerateHere: true,
  },
  {
    table: "marketplace_posts",
    submissionType: "marketplace",
    sourceLabel: "Marketplace",
    workspaceHref: () => "/admin/marketplace",
    normalize: normalizeMarketplaceItem,
    kind: "classified",
    canModerateHere: true,
  },
  {
    table: "marketplace",
    submissionType: "marketplace",
    sourceLabel: "Marketplace",
    workspaceHref: () => "/admin/marketplace",
    normalize: normalizeMarketplaceItem,
    kind: "classified",
    canModerateHere: true,
  },
  {
    table: "job_submissions",
    submissionType: "job",
    sourceLabel: "Jobs",
    workspaceHref: () => "/admin/marketplace",
    normalize: (r) => ({ title: r.job_title || r.title || "Job submission", sender_name: r.employer || r.contact_name, sender_email: r.contact_email || r.email, message: r.description || r.message, status: r.status || "pending" }),
    kind: "job",
    canModerateHere: true,
  },
]

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "submission" | "classified" | "job">("all")

  async function load() {
    setLoading(true)
    setMessage("")

    const inboxPromise = supabase
      .from("submission_inbox")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(150)

    const sourcePromises = SOURCES.map(async (source) => {
      const result = await supabase.from(source.table).select("*").order("created_at", { ascending: false }).limit(150)
      return { source, ...result }
    })

    const [inboxResult, ...sourceResults] = await Promise.all([inboxPromise, ...sourcePromises])
    const next: QueueItem[] = []
    const softErrors: string[] = []

    if (inboxResult.error) {
      softErrors.push(`submission_inbox: ${inboxResult.error.message}`)
    } else {
      for (const row of inboxResult.data || []) {
        const type = String(row.submission_type || "reader_submission").toLowerCase()
        if (type === "contact_message") continue
        const kind = classifyInboxKind(row)
        next.push({
          ...row,
          _table: "submission_inbox",
          _kind: kind,
          _submissionType: type,
          _sourceLabel: labelSubmissionType(type),
          _workspaceHref: inboxWorkspace(type, row),
          _canModerateHere: true,
        })
      }
    }

    for (const result of sourceResults as any[]) {
      const source = result.source as SourceSpec
      if (result.error) {
        // Some historical installations may not contain every optional table.
        softErrors.push(`${source.table}: ${result.error.message}`)
        continue
      }
      for (const row of result.data || []) {
        next.push({
          ...row,
          ...source.normalize(row),
          _table: source.table,
          _kind: source.kind || "submission",
          _submissionType: source.submissionType,
          _sourceLabel: source.sourceLabel,
          _workspaceHref: source.workspaceHref(row),
          _canModerateHere: source.canModerateHere || false,
        })
      }
    }

    const deduped = dedupeSubmissionRows(next).sort((a, b) => rowTime(b) - rowTime(a))
    setItems(deduped)

    if (softErrors.length) {
      setMessage(`Loaded available queues. ${softErrors.length} optional source${softErrors.length === 1 ? "" : "s"} could not be read.`)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const visible = filter === "all" ? items : items.filter((item) => item._kind === filter)
  const counts = useMemo(() => ({
    all: items.length,
    submissions: items.filter((x) => x._kind === "submission").length,
    classifieds: items.filter((x) => x._kind === "classified").length,
    jobs: items.filter((x) => x._kind === "job").length,
    pending: items.filter((x) => isPendingStatus(x.status)).length,
  }), [items])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Submissions</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Reader material that may become published content or a public listing. This page is a clean intake overview; editing, approval and publishing happen in the proper specialist workspace. General correspondence belongs in Inbox.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          <Stat label="All submissions" value={counts.all} />
          <Stat label="Editorial / community" value={counts.submissions} />
          <Stat label="Marketplace" value={counts.classifieds} />
          <Stat label="Jobs" value={counts.jobs} />
          <Stat label="Needs review" value={counts.pending} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All</FilterButton>
          <FilterButton active={filter === "submission"} onClick={() => setFilter("submission")}>Editorial & community</FilterButton>
          <FilterButton active={filter === "classified"} onClick={() => setFilter("classified")}>Marketplace</FilterButton>
          <FilterButton active={filter === "job"} onClick={() => setFilter("job")}>Jobs</FilterButton>
          <button onClick={load} className="hgn-btn-dark ml-auto">Refresh</button>
        </div>

        {message ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading submissions...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-500">No submissions in this view.</p>
      ) : (
        <section className="space-y-3">
          {visible.map((item, index) => {
            const key = `${item._table}:${item.id || index}`
            return (
              <article key={key} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{item._sourceLabel}</span>
                      <span className={statusClass(item.status || "pending")}>{plainStatus(item.status)}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold">{submissionTitle(item)}</h2>
                    <p className="mt-1 text-sm text-slate-500">{formatSubmissionMeta(item)}</p>
                  </div>
                  <Link href={item._workspaceHref} className="hgn-btn-dark text-sm">Review →</Link>
                </div>

                {submissionBody(item) ? <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submissionBody(item)}</p> : null}

                {item.photo_url || item.image_url ? (
                  <a href={item.photo_url || item.image_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold underline">View submitted image →</a>
                ) : null}

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Review and publishing actions are handled in the linked workspace.</p>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

function inboxWorkspace(type: string, row: AnyItem) {
  if (type.includes("letter")) return "/admin/letters"
  if (type.includes("event")) return row.id ? `/admin/events/${row.id}` : "/admin/events"
  if (type.includes("correction")) return "/admin/trust"
  if (type.includes("obituary")) return "/admin/obituaries"
  if (type.includes("visitor") || type.includes("guide")) return "/admin/visitor-guide"
  if (type.includes("live_map")) return "/admin/live-map"
  return "/admin/submissions"
}

function classifyInboxKind(item: AnyItem): QueueItem["_kind"] {
  const type = String(item.submission_type || "").toLowerCase()
  const payload = item.payload || {}
  if (["classified", "classifieds", "marketplace", "marketplace_post", "realty", "real_estate"].includes(type)) return "classified"
  if (["job", "jobs", "job_post", "job_submission"].includes(type)) return "job"
  const sourceTable = String(payload.source_table || "").toLowerCase()
  if (sourceTable.includes("classified") || sourceTable.includes("marketplace")) return "classified"
  if (sourceTable.includes("job")) return "job"
  return "submission"
}

function normalizeMarketplaceItem(item: AnyItem) {
  return {
    title: item.title || item.name || item.item_title,
    description: item.description || item.body || item.details || item.message,
    seller_name: item.seller_name || item.contact_name || item.name || item.sender_name,
    seller_email: item.seller_email || item.contact_email || item.email || item.sender_email,
    seller_phone: item.seller_phone || item.contact_phone || item.phone || item.sender_phone,
    category: item.category || "marketplace",
    status: item.status || "pending",
  }
}

function dedupeSubmissionRows(items: QueueItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const explicitSourceId = String(item.payload?.source_id || item.payload?.record_id || item.source_id || "").trim()
    const exactKey = explicitSourceId ? `${item._submissionType}:${explicitSourceId}` : `${item._table}:${item.id}`
    if (seen.has(exactKey)) return false
    seen.add(exactKey)
    return true
  })
}

function rowTime(item: AnyItem) {
  const value = item.created_at || item.submitted_at || item.updated_at || item.published_at
  const parsed = value ? new Date(value).getTime() : 0
  return Number.isFinite(parsed) ? parsed : 0
}

function submissionTitle(item: QueueItem) {
  return item.title || item.name || item.job_title || item.caption || labelSubmissionType(item._submissionType) || "Untitled submission"
}

function submissionBody(item: QueueItem) {
  return item.message || item.details || item.description || item.body || item.letter || item.notice || item.caption || ""
}

function formatSubmissionMeta(item: QueueItem) {
  const name = item.sender_name || item.submitter_name || item.contact_name || item.organizer_name || item.seller_name || item.employer || item.name || "Unknown sender"
  const email = item.sender_email || item.submitter_email || item.contact_email || item.organizer_email || item.seller_email || item.email || "No email"
  const dateValue = item.created_at || item.submitted_at
  const date = dateValue ? new Date(dateValue).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"
  return `${name} · ${email} · ${date}`
}

function labelSubmissionType(type: string | null | undefined) {
  const value = String(type || "reader_submission").replaceAll("_", " ")
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function isPendingStatus(status: unknown) {
  return ["", "new", "pending", "submitted", "review", "triage"].includes(String(status || "").toLowerCase())
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={active ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white" : "rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"}>{children}</button>
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-slate-100 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>
}

function plainStatus(status: unknown) {
  const value = String(status || "").toLowerCase()
  if (["", "new", "pending", "submitted", "review", "triage"].includes(value)) return "Needs review"
  if (["approved", "accepted", "published", "active"].includes(value)) return "Completed"
  if (["resolved", "replied", "done", "complete", "completed"].includes(value)) return "Completed"
  if (["rejected", "declined"].includes(value)) return "Closed"
  if (["archived"].includes(value)) return "Archived"
  return "In progress"
}

function statusClass(status: string) {
  const value = status.toLowerCase()
  if (["approved", "accepted", "resolved", "published", "active"].includes(value)) return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
  if (["rejected", "declined", "archived"].includes(value)) return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
  return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
}
