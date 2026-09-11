"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ensureHgnProfile } from "@/lib/ensure-hgn-profile"

const dashboardLinks = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/marketplace/my-listings", label: "My Classifieds" },
  { href: "/account/newsletters", label: "My Newsletters" },
  { href: "/account/saved", label: "My Saved Articles" },
  { href: "/account/events", label: "My Event Submissions" },
]

export default function MyHGNPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        await ensureHgnProfile(data.user)
        const { data: profileData } = await supabase
          .from("hgn_profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle()
        setProfile(profileData)
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <main className="mx-auto max-w-6xl px-6 py-10">Loading…</main>

  const isAdmin =
    profile?.is_admin ||
    profile?.can_access_publisher_tools ||
    profile?.account_type === "admin"

  async function handleLogout() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSigningOut(false)
    window.location.href = "/login"
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black tracking-tight">My HGN</h1>
          <p className="mt-3 text-slate-600">Sign in to manage your HGN account, listings, newsletters, events and business profile.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Sign in / Sign up</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Account Dashboard</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-600">{user.email}</p>
            <p className="mt-2 text-sm font-bold text-hgnBlue">{profile?.account_type?.replaceAll("_", " ") || "free individual"}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
          >
            {signingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </section>

      {isAdmin ? (
        <section className="rounded-3xl border border-hgnBlue bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Publisher Tools</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Admin Access</h2>
          <p className="mt-3 text-slate-600">You have publisher/admin access for HGN.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link href="/admin" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Admin Dashboard</Link>
            <Link href="/admin/articles" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue">Articles</Link>
            <Link href="/admin/members" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue">Members</Link>
            <Link href="/admin/marketplace" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue">Marketplace</Link>
            <Link href="/admin/polls" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue">Polls</Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardLinks.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue hover:text-hgnBlue">
            <h2 className="text-xl font-black">{link.label}</h2>
          </Link>
        ))}
      </section>
    </main>
  )
}
