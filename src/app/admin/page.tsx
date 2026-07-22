"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import { adminGroups, adminTools, normalizeAdminRole, type AdminRole } from "@/lib/admin-workspaces"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardPage() {
  const [role, setRole] = useState<AdminRole>("publisher")
  const [name, setName] = useState("")
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

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

  const tools = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return adminTools.filter(tool => {
      const roleMatch = showAll || tool.roles.includes(role) || tool.roles.includes("shared")
      const searchMatch = !needle || [tool.label, tool.description, tool.group, ...tool.keywords].join(" ").toLowerCase().includes(needle)
      return roleMatch && searchMatch
    })
  }, [query, role, showAll])

  const priority = tools.filter(tool => tool.priority).slice(0, 8)
  const workspaceName = role === "sales" ? "Sales" : role === "editor" ? "Editor" : "Publisher"

  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
    <section className="overflow-hidden rounded-3xl border bg-slate-950 p-7 text-white shadow-sm sm:p-9">
      <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">{workspaceName} workspace</p>
      <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{name ? `Welcome, ${name}` : "HGN control room"}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">The tools you need most are up front. Everything else remains searchable without turning the newsroom into a hallway of unlabeled doors.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => setShowAll(false)} className={`rounded-full px-4 py-2 text-sm font-black ${!showAll ? "bg-white text-slate-950" : "border border-slate-600"}`}>My workspace</button>
        <button type="button" onClick={() => setShowAll(true)} className={`rounded-full px-4 py-2 text-sm font-black ${showAll ? "bg-white text-slate-950" : "border border-slate-600"}`}>All connected tools</button>
      </div>
    </section>

    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">Start here</p><h2 className="mt-1 font-serif text-3xl font-bold">Frequent work</h2></div>
        <label className="flex min-w-[260px] items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm"><Search size={17} className="text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search admin tools" className="min-w-0 flex-1 outline-none"/></label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {priority.map(tool => <Link key={tool.href} href={tool.href} className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md"><p className="text-xs font-black uppercase tracking-widest text-slate-500">{tool.group}</p><h3 className="mt-2 text-xl font-black">{tool.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p><ArrowRight className="mt-4 text-hgnBlue transition group-hover:translate-x-1" size={19}/></Link>)}
      </div>
    </section>

    <section className="space-y-6">
      {adminGroups.map(group => {
        const grouped = tools.filter(tool => tool.group === group)
        if (!grouped.length) return null
        return <article key={group} className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-3xl font-bold">{group}</h2><span className="text-xs font-black uppercase tracking-widest text-slate-400">{grouped.length} tools</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{grouped.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl border p-4 hover:border-hgnBlue hover:bg-blue-50"><strong>{tool.label}</strong><span className="mt-1 block text-sm leading-5 text-slate-600">{tool.description}</span></Link>)}</div>
        </article>
      })}
    </section>
  </main>
}
