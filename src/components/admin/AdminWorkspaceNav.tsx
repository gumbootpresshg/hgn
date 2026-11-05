"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react"
import { adminGroups, adminTools, normalizeAdminRole, type AdminRole } from "@/lib/admin-workspaces"
import { supabase } from "@/lib/supabase"

export default function AdminWorkspaceNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<AdminRole>("publisher")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    void (async () => {
      const { data: session } = await supabase.auth.getSession()
      const user = session.session?.user
      if (!user) return
      const { data } = await supabase.from("hgn_profiles").select("account_type,admin_role").eq("user_id", user.id).maybeSingle()
      if (active) setRole(normalizeAdminRole(data?.admin_role || data?.account_type))
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    setOpen(false)
    const current = adminTools.find(tool => tool.href === pathname)
    if (current) setExpanded(new Set([current.group]))
  }, [pathname])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return adminTools.filter(tool => {
      const roleMatch = tool.roles.includes(role) || tool.roles.includes("shared")
      const searchMatch = !needle || [tool.label, tool.description, tool.group, ...tool.keywords].join(" ").toLowerCase().includes(needle)
      return roleMatch && searchMatch
    })
  }, [query, role])

  const visibleGroups = adminGroups.filter(group => visible.some(tool => tool.group === group))
  const shownGroups = query.trim() ? new Set(visibleGroups) : expanded
  const toggleGroup = (group: string) => setExpanded(current => {
    const next = new Set(current)
    next.has(group) ? next.delete(group) : next.add(group)
    return next
  })

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white">
            <Menu size={17} /> <span className="hidden sm:inline">Publisher tools</span>
          </button>
          <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Dashboard</Link>
          <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">My HGN</Link>
          <Link href="/" className="ml-auto rounded-lg border px-3 py-2 text-sm font-bold text-slate-700 hover:border-hgnBlue">View site</Link>
        </div>
      </div>

      {open ? <div className="fixed inset-0 z-[70] bg-slate-950/45" onClick={() => setOpen(false)} /> : null}
      <aside aria-label="Publisher tools" className={"fixed inset-y-0 left-0 z-[80] w-[min(92vw,380px)] overflow-y-auto bg-white shadow-2xl transition-transform " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="sticky top-0 z-10 border-b bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">Haida Gwaii News</p>
              <h2 className="mt-1 font-serif text-3xl font-bold">Publisher tools</h2>
              <p className="mt-1 text-sm text-slate-500">Open only the section you need.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border p-2" aria-label="Close publisher tools"><X size={20} /></button>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
            <Search size={17} className="text-slate-500" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a tool..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
        </div>

        <nav className="divide-y p-3">
          <Link href="/admin" className={"mb-2 block rounded-xl px-3 py-3 font-black " + (pathname === "/admin" ? "bg-blue-50 text-hgnBlue" : "hover:bg-slate-50")}>Dashboard</Link>
          {visibleGroups.map(group => {
            const tools = visible.filter(tool => tool.group === group)
            const isExpanded = shownGroups.has(group)
            return <section key={group} className="py-2">
              <button type="button" onClick={() => toggleGroup(group)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-slate-50">
                <span className="font-black">{group}<span className="ml-2 text-xs font-bold text-slate-400">{tools.length}</span></span>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {isExpanded ? <div className="grid gap-1 px-2 pb-2">
                {tools.map(tool => <Link key={tool.href} href={tool.href} className={"rounded-lg px-3 py-2.5 text-sm transition hover:bg-blue-50 hover:text-hgnBlue " + (pathname === tool.href ? "bg-blue-50 font-black text-hgnBlue" : "font-semibold text-slate-700")}>{tool.label}</Link>)}
              </div> : null}
            </section>
          })}
        </nav>
      </aside>
    </>
  )
}
