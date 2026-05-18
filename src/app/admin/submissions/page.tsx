"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type AnyItem = Record<string, any>

type QueueItem = AnyItem & {
  _table: "submission_inbox" | "classified_submissions" | "classifieds" | "marketplace_posts" | "marketplace" | "job_submissions"
  _kind: "submission" | "classified" | "job"
}

const MARKETPLACE_TYPES = new Set([
  "classified",
  "classifieds",
  "marketplace",
  "marketplace_post",
  "realty",
  "real_estate",
])

const JOB_TYPES = new Set(["job", "jobs", "job_post", "job_submission"])

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<QueueItem[]>([])
  const [classifieds, setClassifieds] = useState<QueueItem[]>([])
  const [jobs, setJobs] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const submissionRes = await supabase
      .from("submission_inbox")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const classifiedSubmissionsRes = await supabase
      .from("classified_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const classifiedsRes = await supabase
      .from("classifieds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const marketplacePostsRes = await supabase
      .from("marketplace_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const marketplaceRes = await supabase
      .from("marketplace")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const jobRes = await supabase
      .from("job_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    const hardErrors = [
      submissionRes.error,
      classifiedSubmissionsRes.error,
      classifiedsRes.error,
      jobRes.error,
    ].filter(Boolean)

    if (hardErrors.length > 0) {
      setMessage(hardErrors[0]?.message || "Could not load one or more submission queues.")
    }

    const inboxRows = (submissionRes.data || []).map((item) => ({
      ...item,
      _table: "submission_inbox" as const,
      _kind: classifyInboxKind(item),
    }))

    const inboxReaderSubmissions = inboxRows.filter((item) => item._kind === "submission")
    const inboxMarketplace = inboxRows.filter((item) => item._kind === "classified").map(normalizeMarketplaceItem)
    const inboxJobs = inboxRows.filter((item) => item._kind === "job")

    setSubmissions(inboxReaderSubmissions)

    setClassifieds([
      ...inboxMarketplace,
      ...(classifiedSubmissionsRes.data || []).map((item) => ({
        ...normalizeMarketplaceItem(item),
        _table: "classified_submissions" as const,
        _kind: "classified" as const,
      })),
      ...(classifiedsRes.data || []).map((item) => ({
        ...normalizeMarketplaceItem(item),
        _table: "classifieds" as const,
        _kind: "classified" as const,
      })),
      ...(marketplacePostsRes.error ? [] : (marketplacePostsRes.data || []).map((item) => ({
        ...normalizeMarketplaceItem(item),
        _table: "marketplace_posts" as const,
        _kind: "classified" as const,
      }))),
      ...(marketplaceRes.error ? [] : (marketplaceRes.data || []).map((item) => ({
        ...normalizeMarketplaceItem(item),
        _table: "marketplace" as const,
        _kind: "classified" as const,
      }))),
    ])

    setJobs([
      ...inboxJobs,
      ...(jobRes.data || []).map((item) => ({
        ...item,
        _table: "job_submissions" as const,
        _kind: "job" as const,
      })),
    ])

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function setStatus(item: QueueItem, status: "pending" | "approved" | "rejected") {
    setWorkingId(item.id)
    setMessage("")

    const { error } = await supabase
      .from(item._table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorkingId("")
  }

  async function deleteItem(item: QueueItem) {
    const ok = window.confirm("Delete this item? This cannot be undone.")
    if (!ok) return

    setWorkingId(item.id)
    setMessage("")

    const { error } = await supabase.from(item._table).delete().eq("id", item.id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorkingId("")
  }

  const counts = useMemo(() => ({
    submissions: submissions.length,
    classifieds: classifieds.length,
    jobs: jobs.length,
    pending:
      submissions.filter((x) => (x.status || "pending") === "pending").length +
      classifieds.filter((x) => (x.status || "pending") === "pending").length +
      jobs.filter((x) => (x.status || "pending") === "pending").length,
  }), [submissions, classifieds, jobs])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Submissions Review
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Reader submissions are now separated from marketplace/classifieds and jobs.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Reader submissions" value={counts.submissions} />
          <Stat label="Marketplace" value={counts.classifieds} />
          <Stat label="Jobs" value={counts.jobs} />
          <Stat label="Pending" value={counts.pending} />
        </div>

        <button
          onClick={load}
          className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>

        {message ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </p>
        ) : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading submissions...</p>
      ) : (
        <>
          <GenericSection
            title="Reader submissions"
            empty="No reader tips, letters, events, notices, or obituaries yet."
            items={submissions}
            titleFor={(item) => item.title || labelSubmissionType(item.submission_type) || "Untitled submission"}
            metaFor={(item) => `${labelSubmissionType(item.submission_type)} · ${item.sender_name || "Unknown sender"} · ${item.sender_email || "No email"} · ${item._table}`}
            bodyFor={(item) => item.message}
            workingId={workingId}
            onStatus={setStatus}
            onDelete={deleteItem}
          />
          <GenericSection
            title="Marketplace / classifieds"
            empty="No marketplace posts yet."
            items={dedupeByTableAndId(classifieds)}
            titleFor={(item) => item.title || item.name || item.item_title || "Untitled classified"}
            metaFor={(item) =>
              `${item.category || "marketplace"} · ${item.seller_name || item.contact_name || item.name || "Unknown seller"} · ${item.seller_email || item.email || item.contact_email || "No email"} · ${item._table}`
            }
            bodyFor={(item) => item.description || item.body || item.details || item.message}
            workingId={workingId}
            onStatus={setStatus}
            onDelete={deleteItem}
          />
          <GenericSection
            title="Job board posts"
            empty="No job posts yet."
            items={dedupeByTableAndId(jobs)}
            titleFor={(item) => item.job_title || item.title || "Untitled job"}
            metaFor={(item) => `${item.employer || "Unknown employer"} · ${item.contact_email || item.email || item.sender_email || "No email"} · ${item._table}`}
            bodyFor={(item) => item.description || item.message}
            workingId={workingId}
            onStatus={setStatus}
            onDelete={deleteItem}
          />
        </>
      )}
    </main>
  )
}

function classifyInboxKind(item: AnyItem): "submission" | "classified" | "job" {
  const type = String(item.submission_type || "").toLowerCase()
  const payload = item.payload || {}

  if (MARKETPLACE_TYPES.has(type)) return "classified"
  if (JOB_TYPES.has(type)) return "job"

  const sourceTable = String(payload.source_table || "").toLowerCase()
  if (sourceTable.includes("classified") || sourceTable.includes("marketplace")) return "classified"
  if (sourceTable.includes("job")) return "job"

  if (payload.classified_id || payload.price || payload.seller_email) return "classified"
  if (payload.job_title || payload.employer || payload.how_to_apply) return "job"

  return "submission"
}

function labelSubmissionType(type: string | null | undefined) {
  const value = String(type || "reader_submission").replaceAll("_", " ")
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function normalizeMarketplaceItem(item: AnyItem): QueueItem {
  return {
    ...item,
    title: item.title || item.name || item.item_title,
    description: item.description || item.body || item.details || item.message,
    seller_name: item.seller_name || item.contact_name || item.name || item.sender_name,
    seller_email: item.seller_email || item.contact_email || item.email || item.sender_email,
    seller_phone: item.seller_phone || item.contact_phone || item.phone || item.sender_phone,
    category: item.category || "marketplace",
    status: item.status || "pending",
    _table: item._table || "classifieds",
    _kind: "classified",
  }
}

function dedupeByTableAndId(items: QueueItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item._table}:${item.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function GenericSection({
  title,
  empty,
  items,
  titleFor,
  metaFor,
  bodyFor,
  workingId,
  onStatus,
  onDelete,
}: {
  title: string
  empty: string
  items: QueueItem[]
  titleFor: (item: QueueItem) => string
  metaFor: (item: QueueItem) => string
  bodyFor: (item: QueueItem) => string | null | undefined
  workingId: string
  onStatus: (item: QueueItem, status: "pending" | "approved" | "rejected") => void
  onDelete: (item: QueueItem) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">{empty}</p>
      ) : (
        items.map((item, index) => (
          <article key={item.id || `${title}-${index}`} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">{titleFor(item)}</h3>
              <span className={statusClass(item.status || "pending")}>
                {item.status || "pending"}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">{metaFor(item)}</p>

            {bodyFor(item) ? (
              <p className="mt-3 line-clamp-3 text-sm text-slate-700">{bodyFor(item)}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                disabled={workingId === item.id}
                onClick={() => onStatus(item, "approved")}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={workingId === item.id}
                onClick={() => onStatus(item, "pending")}
                className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50"
              >
                Pending
              </button>
              <button
                disabled={workingId === item.id}
                onClick={() => onStatus(item, "rejected")}
                className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={workingId === item.id}
                onClick={() => onDelete(item)}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

function statusClass(status: string) {
  if (status === "approved") {
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
  }

  if (status === "rejected") {
    return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
  }

  return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
}
