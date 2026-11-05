"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type AnyItem = Record<string, any>
type QueueState = "active" | "archived" | "deleted"
type WorkflowStage = "new" | "in_progress" | "done" | "backlog" | "archived" | "deleted"
type QueueItem = AnyItem & {
  _table: string
  _kind: "submission" | "classified" | "job"
  _submissionType: string
  _sourceLabel: string
  _workspaceHref: string
  _queueTable: string
  _queueId: string
  _queueState?: QueueState
  _workflowStage?: WorkflowStage
}
type StateRow = {
  source_table: string
  source_id: string
  queue_state?: QueueState
  workflow_stage?: WorkflowStage
  reviewed_at?: string | null
}

type SourceSpec = {
  table: string
  submissionType: string
  sourceLabel: string
  workspaceHref: (row: AnyItem) => string
  normalize: (row: AnyItem) => Partial<QueueItem>
  kind?: QueueItem["_kind"]
}

const SOURCES: SourceSpec[] = [
  { table: "letters_to_editor", submissionType: "letter", sourceLabel: "Letters to the Editor", workspaceHref: () => "/admin/letters", normalize: r => ({ title: "Letter to the Editor", sender_name: r.name, sender_email: r.email, message: r.letter, status: r.status || "new" }) },
  { table: "event_submissions", submissionType: "event", sourceLabel: "Events", workspaceHref: r => r.id ? `/admin/events/${r.id}` : "/admin/events", normalize: r => ({ title: r.title || "Event submission", sender_name: r.organizer_name, sender_email: r.organizer_email, message: r.description, status: r.status || "pending" }) },
  { table: "story_tips", submissionType: "story_tip", sourceLabel: "Story Tips", workspaceHref: () => "/admin/submissions", normalize: r => ({ title: r.title || "Story tip", sender_name: r.name, sender_email: r.email, message: r.details, status: r.status || "new" }) },
  { table: "correction_requests", submissionType: "correction", sourceLabel: "Corrections", workspaceHref: () => "/admin/trust", normalize: r => ({ title: r.story_url || r.article_url || r.article_title || "Correction request", sender_name: r.name || r.submitter_name, sender_email: r.email || r.submitter_email, message: r.details || r.message, status: r.status || "new" }) },
  { table: "photo_submissions", submissionType: "photo", sourceLabel: "Reader Photos", workspaceHref: () => "/admin/island-lens", normalize: r => ({ title: r.caption || "Reader photo", sender_name: r.name, sender_email: r.email, message: r.caption, status: r.status || "new" }) },
  { table: "notices", submissionType: "notice", sourceLabel: "Community Notices", workspaceHref: () => "/admin/submissions", normalize: r => ({ title: r.title || "Community notice", sender_name: r.contact_name, sender_email: r.contact_email, message: r.body || r.message || r.details || r.notice, status: r.status || "pending" }) },
  { table: "obituaries", submissionType: "obituary", sourceLabel: "Obituaries", workspaceHref: () => "/admin/obituaries", normalize: r => ({ title: r.name || r.title || "Obituary submission", sender_name: r.contact_name, sender_email: r.contact_email, message: r.details || r.notice || r.message, status: r.status || "pending" }) },
  { table: "visitor_listings", submissionType: "visitor_listing", sourceLabel: "Visitor Guide", workspaceHref: () => "/admin/visitor-guide", normalize: r => ({ title: r.title || "Visitor Guide submission", sender_name: r.submitter_name, sender_email: r.submitter_email, message: r.description, status: r.status || "pending" }) },
  { table: "live_map_items", submissionType: "live_map", sourceLabel: "Live Map", workspaceHref: () => "/admin/live-map", normalize: r => ({ title: r.title || "Live Map submission", sender_name: r.contact_name, sender_email: r.contact_email, message: r.details, status: r.status || "pending" }) },
  { table: "classified_submissions", submissionType: "classified", sourceLabel: "Marketplace / Classifieds", workspaceHref: () => "/admin/marketplace", normalize: normalizeMarketplaceItem, kind: "classified" },
  { table: "classifieds", submissionType: "classified", sourceLabel: "Marketplace / Classifieds", workspaceHref: () => "/admin/marketplace", normalize: normalizeMarketplaceItem, kind: "classified" },
  { table: "marketplace_posts", submissionType: "marketplace", sourceLabel: "Marketplace", workspaceHref: () => "/admin/marketplace", normalize: normalizeMarketplaceItem, kind: "classified" },
  { table: "marketplace", submissionType: "marketplace", sourceLabel: "Marketplace", workspaceHref: () => "/admin/marketplace", normalize: normalizeMarketplaceItem, kind: "classified" },
  { table: "job_submissions", submissionType: "job", sourceLabel: "Jobs", workspaceHref: () => "/admin/marketplace", normalize: r => ({ title: r.job_title || r.title || "Job submission", sender_name: r.employer || r.contact_name, sender_email: r.contact_email || r.email, message: r.description || r.message, status: r.status || "pending" }), kind: "job" },
]

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const tabs: Array<[WorkflowStage, string]> = [["new", "New"], ["in_progress", "In progress"], ["done", "Completed"], ["backlog", "Older backlog"], ["archived", "Archive"], ["deleted", "Trash"]]

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [working, setWorking] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [view, setView] = useState<WorkflowStage>("new")
  const [filter, setFilter] = useState<"all" | QueueItem["_kind"]>("all")

  function itemKey(item: QueueItem) {
    return `${item._queueTable}:${item._queueId}`
  }

  async function authHeaders() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ? { authorization: `Bearer ${data.session.access_token}` } : {}
  }

  async function action(actionName: "start" | "complete" | "return_new" | "archive" | "delete" | "restore", targets: QueueItem[]) {
    if (!targets.length) return
    if (actionName === "delete" && !window.confirm(`Move ${targets.length === 1 ? "this submission" : `${targets.length} submissions`} to Trash? The source record remains recoverable.`)) return
    setWorking(true)
    setMessage("")
    const response = await fetch("/api/admin/incoming-state", {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionName, items: targets.map(item => ({ source_table: item._queueTable, source_id: item._queueId })) }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || "The intake action could not be saved.")
    else {
      setSelected(new Set())
      await load()
    }
    setWorking(false)
  }

  async function load() {
    setLoading(true)
    setMessage("")
    const inboxPromise = supabase.from("submission_inbox").select("*").order("created_at", { ascending: false }).limit(200)
    const sourcePromises = SOURCES.map(async source => ({ source, ...(await supabase.from(source.table).select("*").order("created_at", { ascending: false }).limit(200)) }))
    const statePromise = fetch("/api/admin/incoming-state", { headers: await authHeaders() }).then(async response => ({ response, body: await response.json().catch(() => ({})) }))
    const [inboxResult, ...tail] = await Promise.all([inboxPromise, ...sourcePromises, statePromise])
    const stateResult = tail.pop() as { response: Response, body: { states?: StateRow[], migration_required?: boolean } }
    const stateMap = new Map<string, StateRow>((stateResult?.body.states || []).map(row => [`${row.source_table}:${row.source_id}`, row]))
    const next: QueueItem[] = []
    const softErrors: string[] = []

    if (inboxResult.error) softErrors.push("submission inbox")
    else for (const row of inboxResult.data || []) {
      if (String(row.submission_type || "").toLowerCase() === "contact_message") continue
      const type = String(row.submission_type || "reader_submission").toLowerCase()
      const queueTable = String(row.payload?.source_table || "").trim() || "submission_inbox"
      const queueId = String(row.payload?.source_id || row.payload?.record_id || "").trim() || String(row.id || "")
      next.push({ ...row, _table: "submission_inbox", _kind: classifyInboxKind(row), _submissionType: type, _sourceLabel: label(type), _workspaceHref: inboxWorkspace(type, row), _queueTable: queueTable, _queueId: queueId })
    }

    for (const result of tail as Array<{ source: SourceSpec, data?: AnyItem[], error?: unknown }>) {
      if (result.error) { softErrors.push(result.source.table); continue }
      for (const row of result.data || []) {
        if (result.source.table === "event_submissions" && /^(AI Desk research promotion|Created from AI Desk item)/.test(String(row.admin_notes || ""))) continue
        next.push({ ...row, ...result.source.normalize(row), _table: result.source.table, _kind: result.source.kind || "submission", _submissionType: result.source.submissionType, _sourceLabel: result.source.sourceLabel, _workspaceHref: result.source.workspaceHref(row), _queueTable: result.source.table, _queueId: String(row.id || row.source_id || "") })
      }
    }

    const now = Date.now()
    const deduped = dedupe(next).map(item => {
      const state = stateMap.get(itemKey(item))
      return { ...item, _queueState: state?.queue_state || "active", _workflowStage: stageFor(item, state, now) }
    }).sort((a, b) => rowTime(b) - rowTime(a))
    setItems(deduped)
    if (stateResult?.body.migration_required) setMessage("Run the new intake workflow SQL once to save New, In progress and Completed states.")
    else if (softErrors.length) setMessage(`Loaded available queues. ${softErrors.length} optional source${softErrors.length === 1 ? "" : "s"} could not be read.`)
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const counts = useMemo(() => Object.fromEntries(tabs.map(([stage]) => [stage, items.filter(item => item._workflowStage === stage).length])) as Record<WorkflowStage, number>, [items])
  const inView = items.filter(item => item._workflowStage === view)
  const visible = filter === "all" ? inView : inView.filter(item => item._kind === filter)
  const selectedItems = visible.filter(item => selected.has(itemKey(item)))

  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[.2em] text-hgnBlue">Incoming</p>
      <h1 className="mt-3 font-serif text-5xl font-bold text-hgnNavy">Submissions</h1>
      <p className="mt-3 max-w-3xl text-slate-600">The New queue is only the last 30 days of unfinished reader submissions. Older records stay available in Older backlog rather than inflating today’s count.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="New" value={counts.new} emphasis />
        <Stat label="In progress" value={counts.in_progress} />
        <Stat label="Completed" value={counts.done} />
        <Stat label="Older backlog" value={counts.backlog} />
        <Stat label="Archived" value={counts.archived} />
        <Stat label="Trash" value={counts.deleted} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
        {tabs.map(([stage, name]) => <TabButton key={stage} active={view === stage} onClick={() => { setView(stage); setSelected(new Set()) }}>{name}{counts[stage] ? ` (${counts[stage]})` : ""}</TabButton>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <TabButton active={filter === "all"} onClick={() => setFilter("all")}>All types</TabButton>
        <TabButton active={filter === "submission"} onClick={() => setFilter("submission")}>Editorial & community</TabButton>
        <TabButton active={filter === "classified"} onClick={() => setFilter("classified")}>Marketplace</TabButton>
        <TabButton active={filter === "job"} onClick={() => setFilter("job")}>Jobs</TabButton>
        <button onClick={() => void load()} className="ml-auto rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Refresh</button>
      </div>
      {visible.length ? <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
        <label className="mr-2 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={visible.every(item => selected.has(itemKey(item)))} onChange={event => setSelected(event.target.checked ? new Set(visible.map(itemKey)) : new Set())} /> Select all in view</label>
        {selectedItems.length ? <span className="text-sm text-slate-500">{selectedItems.length} selected</span> : null}
        <Actions stage={view} disabled={working || !selectedItems.length} onAction={name => void action(name, selectedItems)} />
      </div> : null}
      {message ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
    </section>

    {loading ? <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading submissions...</p> : null}
    {!loading && !visible.length ? <p className="rounded-2xl border bg-white p-6 text-slate-500">Nothing in this queue.</p> : null}
    <section className="space-y-3">
      {visible.map(item => <article key={itemKey(item)} className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <input aria-label="Select submission" type="checkbox" className="mt-1" checked={selected.has(itemKey(item))} onChange={event => setSelected(current => { const next = new Set(current); event.target.checked ? next.add(itemKey(item)) : next.delete(itemKey(item)); return next })} />
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{item._sourceLabel}</span><Status stage={item._workflowStage || "backlog"} /></div>
              <h2 className="mt-3 text-xl font-bold">{titleFor(item)}</h2>
              <p className="mt-1 text-sm text-slate-500">{metaFor(item)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={item._workspaceHref} className="rounded-full bg-hgnBlue px-4 py-2 text-sm font-bold text-white">Review</Link>
            <Actions stage={item._workflowStage || "backlog"} disabled={working} onAction={name => void action(name, [item])} />
          </div>
        </div>
        {bodyFor(item) ? <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{bodyFor(item)}</p> : null}
        {(item.photo_url || item.image_url) ? <a href={item.photo_url || item.image_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold underline">View submitted image →</a> : null}
      </article>)}
    </section>
  </main>
}

function Actions({ stage, disabled, onAction }: { stage: WorkflowStage, disabled: boolean, onAction: (action: "start" | "complete" | "return_new" | "archive" | "delete" | "restore") => void }) {
  if (stage === "new" || stage === "backlog") return <><button disabled={disabled} onClick={() => onAction("start")} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">Start</button><button disabled={disabled} onClick={() => onAction("archive")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Archive</button><button disabled={disabled} onClick={() => onAction("delete")} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-40">Trash</button></>
  if (stage === "in_progress") return <><button disabled={disabled} onClick={() => onAction("complete")} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Complete</button><button disabled={disabled} onClick={() => onAction("return_new")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Return to new</button></>
  if (stage === "done") return <><button disabled={disabled} onClick={() => onAction("return_new")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Reopen</button><button disabled={disabled} onClick={() => onAction("archive")} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Archive</button></>
  return <button disabled={disabled} onClick={() => onAction("restore")} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Restore to new</button>
}

function stageFor(item: QueueItem, state: StateRow | undefined, now: number): WorkflowStage {
  if (state?.queue_state === "deleted") return "deleted"
  if (state?.queue_state === "archived") return "archived"
  if (state?.workflow_stage && ["new", "in_progress", "done", "archived", "deleted"].includes(state.workflow_stage)) return state.workflow_stage
  if (isComplete(item.status)) return "done"
  if (isPending(item.status) && rowTime(item) >= now - NEW_WINDOW_MS) return "new"
  return "backlog"
}

function dedupe(items: QueueItem[]) {
  const seen = new Set<string>()
  return items.filter(item => { const key = `${item._queueTable}:${item._queueId}`; if (!item._queueId || seen.has(key)) return false; seen.add(key); return true })
}
function classifyInboxKind(item: AnyItem): QueueItem["_kind"] {
  const type = String(item.submission_type || "").toLowerCase()
  const source = String(item.payload?.source_table || "").toLowerCase()
  if (/classified|marketplace|realty/.test(type) || /classified|marketplace/.test(source)) return "classified"
  return /job/.test(type) || /job/.test(source) ? "job" : "submission"
}
function normalizeMarketplaceItem(item: AnyItem) { return { title: item.title || item.name || item.item_title, message: item.description || item.body || item.details || item.message, sender_name: item.seller_name || item.contact_name || item.name || item.sender_name, sender_email: item.seller_email || item.contact_email || item.email || item.sender_email, status: item.status || "pending" } }
function inboxWorkspace(type: string, row: AnyItem) {
  if (type.includes("letter")) return "/admin/letters"
  if (type.includes("event")) return row.id ? `/admin/events/${row.id}` : "/admin/events"
  if (type.includes("correction")) return "/admin/trust"
  if (type.includes("obituary")) return "/admin/obituaries"
  if (type.includes("visitor") || type.includes("guide")) return "/admin/visitor-guide"
  return "/admin/submissions"
}
function rowTime(item: AnyItem) { const time = new Date(item.created_at || item.submitted_at || item.updated_at || 0).getTime(); return Number.isFinite(time) ? time : 0 }
function isPending(status: unknown) { return ["", "new", "pending", "submitted", "review", "triage"].includes(String(status || "").toLowerCase()) }
function isComplete(status: unknown) { return ["approved", "accepted", "published", "active", "resolved", "replied", "done", "complete", "completed", "rejected", "declined"].includes(String(status || "").toLowerCase()) }
function label(value: string) { const text = value.replaceAll("_", " "); return text.charAt(0).toUpperCase() + text.slice(1) }
function titleFor(item: QueueItem) { return item.title || item.name || item.job_title || item.caption || label(item._submissionType) || "Untitled submission" }
function bodyFor(item: QueueItem) { return item.message || item.details || item.description || item.body || item.letter || item.notice || item.caption || "" }
function metaFor(item: QueueItem) {
  const name = item.sender_name || item.submitter_name || item.contact_name || item.organizer_name || item.employer || item.name || "Unknown sender"
  const email = item.sender_email || item.submitter_email || item.contact_email || item.organizer_email || item.email || "No email"
  const date = rowTime(item) ? new Date(rowTime(item)).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"
  return `${name} · ${email} · ${date}`
}
function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) { return <button onClick={onClick} className={active ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white" : "rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"}>{children}</button> }
function Stat({ label, value, emphasis }: { label: string, value: number, emphasis?: boolean }) { return <div className={emphasis ? "rounded-2xl bg-amber-100 p-4" : "rounded-2xl bg-slate-100 p-4"}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div> }
function Status({ stage }: { stage: WorkflowStage }) { const labels: Record<WorkflowStage, string> = { new: "New", in_progress: "In progress", done: "Completed", backlog: "Older backlog", archived: "Archived", deleted: "Trash" }; return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{labels[stage]}</span> }
