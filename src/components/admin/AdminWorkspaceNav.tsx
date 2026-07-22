"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Menu, Search, X } from "lucide-react"
import { adminGroups, adminTools, normalizeAdminRole, type AdminRole } from "@/lib/admin-workspaces"
import { supabase } from "@/lib/supabase"

export default function AdminWorkspaceNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<AdminRole>("publisher")

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

  useEffect(() => setOpen(false), [pathname])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return adminTools.filter(tool => {
      const roleMatch = tool.roles.includes(role) || tool.roles.includes("shared")
      const searchMatch = !needle || [tool.label, tool.description, tool.group, ...tool.keywords].join(" ").toLowerCase().includes(needle)
      return roleMatch && searchMatch
    })
  }, [query, role])

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white">
            <Menu size={17} /> Admin menu
          </button>
          <Link href="/admin" className="hidden rounded-xl border px-4 py-2 text-sm font-bold text-slate-700 sm:inline-block">Dashboard</Link>
          <Link href="/" className="rounded-xl border px-4 py-2 text-sm font-bold text-slate-700">View site</Link>
          <span className="ml-auto hidden text-xs font-black uppercase tracking-widest text-slate-500 md:block">{role} workspace</span>
        </div>
      </div>

      {open ? <div className="fixed inset-0 z-[70] bg-slate-950/45" onClick={() => setOpen(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-[80] w-[min(92vw,390px)] transform overflow-y-auto bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="sticky top-0 border-b bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">HGN Admin</p>
              <h2 className="mt-1 font-serif text-3xl font-bold">{role === "sales" ? "Sales workspace" : role === "editor" ? "Editor workspace" : "Publisher workspace"}</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border p-2" aria-label="Close admin menu"><X size={20} /></button>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
            <Search size={17} className="text-slate-500" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a tool..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
        </div>
        <nav className="space-y-6 p-5">
          {adminGroups.map(group => {
            const tools = visible.filter(tool => tool.group === group)
            if (!tools.length) return null
            return <section key={group}>
              <h3 className="mb-2 text-xs font-black uppercase tracking-[.16em] text-slate-500">{group}</h3>
              <div className="grid gap-2">
                {tools.map(tool => <Link key={tool.href} href={tool.href} className={`rounded-xl border p-3 transition hover:border-hgnBlue hover:bg-blue-50 ${pathname === tool.href ? "border-hgnBlue bg-blue-50" : "bg-white"}`}>
                  <strong className="block text-sm">{tool.label}</strong>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{tool.description}</span>
                </Link>)}
              </div>
            </section>
          })}
        </nav>
      </aside>
    </>
  )
}
