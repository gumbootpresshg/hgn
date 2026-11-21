"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ChevronDown, ChevronRight, Search } from "lucide-react"
import { adminGroups, adminTools, normalizeAdminRole, type AdminRole } from "@/lib/admin-workspaces"
import { supabase } from "@/lib/supabase"

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
type SignupPreview = { id: string; email?: string | null; display_name?: string | null; name?: string | null; created_at?: string | null }

export default function AdminDashboardPage() {
  const [role, setRole] = useState<AdminRole>("publisher")
  const [name, setName] = useState("")
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const [incoming, setIncoming] = useState({ unread: 0, submissions: 0, members: 0, subscribers: 0 })
  const [latestSignups, setLatestSignups] = useState<{ members: SignupPreview[]; subscribers: SignupPreview[] }>({ members: [], subscribers: [] })

  useEffect(() => {
    let active = true
    void (async () => {
      const { data: session } = await supabase.auth.getSession()
      const user = session.session?.user
      if (!user) return
      const { data } = await supabase.from("hgn_profiles").select("account_type,admin_role,full_name,display_name").eq("user_id", user.id).maybeSingle()
      if (!active) return
      setRole(normalizeAdminRole(data?.admin_role || data?.account_type))
      setName(String(data?.display_name || data?.full_name || ""))
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      const since = new Date(Date.now() - NEW_WINDOW_MS).toISOString()
      const [contacts, signups, members, subscribers, latestMembers, latestSubscribers, letters, events, tips, obits] = await Promise.all([
        supabase.from("submission_inbox").select("id", { count: "exact", head: true }).eq("submission_type", "contact_message").is("archived_at", null).is("read_at", null).gte("created_at", since),
        supabase.from("submission_inbox").select("id", { count: "exact", head: true }).in("submission_type", ["account_signup", "newsletter_signup"]).eq("status", "new").gte("created_at", since),
        supabase.from("hgn_profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("id", { count: "exact", head: true }),
        supabase.from("hgn_profiles").select("id,display_name,email,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("subscribers").select("id,name,email,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("letters_to_editor").select("id", { count: "exact", head: true }).in("status", ["new", "pending", "submitted", "review"]).gte("created_at", since),
        supabase.from("event_submissions").select("id, admin_notes").in("status", ["new", "pending", "submitted", "review"]).gte("created_at", since),
        supabase.from("story_tips").select("id", { count: "exact", head: true }).in("status", ["new", "pending", "submitted", "review"]).gte("created_at", since),
        supabase.from("obituaries").select("id", { count: "exact", head: true }).in("status", ["new", "pending", "submitted", "review"]).gte("created_at", since),
      ])
      // Keep the dashboard badge aligned with the actual Submissions queue.
      // Automated AI Desk event research is intentionally excluded there, so
      // it must never inflate this count.
      const readerEvents = (events.data || []).filter((event: any) => !/^(AI Desk research promotion|Created from AI Desk item)/.test(String(event.admin_notes || ""))).length
      if (active) setIncoming({
        unread: contacts.count || 0,
        submissions: (signups.count || 0) + (letters.count || 0) + readerEvents + (tips.count || 0) + (obits.count || 0),
        members: members.count || 0,
        subscribers: subscribers.count || 0,
      })
      if (active) setLatestSignups({ members: (latestMembers.data || []) as SignupPreview[], subscribers: (latestSubscribers.data || []) as SignupPreview[] })
    })()
    return () => { active = false }
  }, [])

  const tools = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return adminTools.filter(tool => {
      const roleMatch = showAll || tool.roles.includes(role) || tool.roles.includes("shared")
      const searchMatch = !needle || [tool.label, tool.description, tool.group, ...tool.keywords].join(" ").toLowerCase().includes(needle)
      return roleMatch && searchMatch
    })
  }, [query, role, showAll])

  const priority = tools.filter(tool => tool.priority).slice(0, 8)
  const workspaceName = role === "sales" ? "Sales" : role === "editor" ? "Editorial" : "Publisher"
  const grouped = adminGroups.map(group => ({ group, tools: tools.filter(tool => tool.group === group) })).filter(entry => entry.tools.length)
  const searching = Boolean(query.trim())
  const toggleGroup = (group: string) => setOpenGroups(current => {
    const next = new Set(current)
    next.has(group) ? next.delete(group) : next.add(group)
    return next
  })

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6">
    <section className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">{workspaceName} workspace</p>
        <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{name ? "Welcome back, " + name : "HGN admin"}</h1>
        <p className="mt-1 text-sm text-slate-600">Your personal HGN account is separate. This area is only for running the paper.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href="/account" className="rounded-xl border px-4 py-2.5 text-sm font-bold hover:border-hgnBlue">My HGN</Link>
        <Link href="/admin/articles" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">New article</Link>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Link href="/admin/inbox" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
        <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">New in the last 30 days</p>
        <div className="mt-2 flex items-end justify-between gap-4"><h2 className="font-serif text-3xl font-bold">Inbox</h2><strong className="text-4xl">{incoming.unread}</strong></div>
        <p className="mt-2 text-sm text-slate-600">Unread messages only. Older mail stays safely in the backlog.</p>
      </Link>
      <Link href="/admin/submissions" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
        <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">New in the last 30 days</p>
        <div className="mt-2 flex items-end justify-between gap-4"><h2 className="font-serif text-3xl font-bold">Submissions</h2><strong className="text-4xl">{incoming.submissions}</strong></div>
        <p className="mt-2 text-sm text-slate-600">Items that need editorial or community review.</p>
      </Link>
      <Link href="/admin/members" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
        <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">All reader accounts</p>
        <div className="mt-2 flex items-end justify-between gap-4"><h2 className="font-serif text-3xl font-bold">Reader accounts</h2><strong className="text-4xl">{incoming.members}</strong></div>
        <p className="mt-2 text-sm text-slate-600">Every HGN login, member status and account detail.</p>
      </Link>
      <Link href="/admin/subscribers" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
        <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">All newsletter signups</p>
        <div className="mt-2 flex items-end justify-between gap-4"><h2 className="font-serif text-3xl font-bold">Newsletter signups</h2><strong className="text-4xl">{incoming.subscribers}</strong></div>
        <p className="mt-2 text-sm text-slate-600">Every signup, including unsubscribed readers and welcome status.</p>
      </Link>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <SignupPanel title="Latest reader accounts" href="/admin/members" empty="No reader accounts yet." rows={latestSignups.members} />
      <SignupPanel title="Latest newsletter signups" href="/admin/subscribers" empty="No newsletter signups yet." rows={latestSignups.subscribers} />
    </section>

    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">Start here</p><h2 className="mt-1 font-serif text-3xl font-bold">Frequent work</h2></div>
        <label className="flex min-w-[250px] items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm"><Search size={17} className="text-slate-500"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a publisher tool" className="min-w-0 flex-1 outline-none"/></label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {priority.map(tool => <Link key={tool.href} href={tool.href} className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md"><p className="text-xs font-black uppercase tracking-widest text-slate-500">{tool.group}</p><h3 className="mt-2 text-lg font-black">{tool.label}</h3><p className="mt-2 text-sm leading-5 text-slate-600">{tool.description}</p><ArrowRight className="mt-3 text-hgnBlue transition group-hover:translate-x-1" size={18}/></Link>)}
      </div>
    </section>

    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">All publisher tools</p><h2 className="mt-1 font-serif text-3xl font-bold">Open a section when you need it</h2></div>
        <button type="button" onClick={() => setShowAll(value => !value)} className="rounded-xl border px-4 py-2 text-sm font-bold hover:border-hgnBlue">{showAll ? "My workspace only" : "Show connected tools"}</button>
      </div>
      <div className="divide-y">
        {grouped.map(entry => {
          const isOpen = searching || openGroups.has(entry.group)
          return <article key={entry.group}>
            <button type="button" onClick={() => toggleGroup(entry.group)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50">
              <span><strong className="text-lg">{entry.group}</strong><span className="ml-2 text-sm text-slate-400">{entry.tools.length} tools</span></span>
              {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {isOpen ? <div className="grid gap-3 border-t bg-slate-50/70 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {entry.tools.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl border bg-white p-4 hover:border-hgnBlue hover:bg-blue-50"><strong>{tool.label}</strong><span className="mt-1 block text-sm leading-5 text-slate-600">{tool.description}</span></Link>)}
            </div> : null}
          </article>
        })}
      </div>
    </section>
  </main>
}

function SignupPanel({ title, href, empty, rows }: { title: string; href: string; empty: string; rows: SignupPreview[] }) {
  return <section className="rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><h2 className="font-serif text-2xl font-bold">{title}</h2><Link href={href} className="text-sm font-bold text-hgnBlue hover:underline">View all →</Link></div>
    {rows.length ? <div className="mt-4 divide-y">{rows.map(row => <div key={row.id} className="py-3 first:pt-0 last:pb-0"><strong className="block truncate">{row.display_name || row.name || "Name not provided"}</strong><div className="mt-0.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm text-slate-600"><span className="truncate">{row.email || "No email"}</span><span className="whitespace-nowrap text-xs">{signupDate(row.created_at)}</span></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">{empty}</p>}
  </section>
}

function signupDate(value?: string | null) {
  if (!value) return "Date unavailable"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
}
