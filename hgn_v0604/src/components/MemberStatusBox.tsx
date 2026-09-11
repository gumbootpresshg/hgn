"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MemberStatusBox() {
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: perms } = await supabase
          .from("member_permissions")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle()
        setPermissions(perms)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null

  if (!user) {
    return (
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">HGN Members</p>
        <h2 className="mt-2 text-2xl font-black">Become an HGN Member</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Free members can post classifieds and manage their listings. Paid members will be able to build their own printable HGN edition.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/login" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950">Sign up / Sign in</Link>
          <Link href="/membership" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white">Learn more</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Signed in</p>
      <h2 className="mt-2 text-2xl font-black">Your HGN Account</h2>
      <p className="mt-2 text-sm text-slate-600">{user.email}</p>
      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p>Classifieds: enabled</p>
        <p>Paid member: {permissions?.is_paid_member || permissions?.verified_plus ? "yes" : "not active"}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/marketplace/my-listings" className="rounded-full border px-4 py-2 text-sm font-bold">Manage Listings</Link>
        <Link href="/account/newspaper" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Build My Newspaper</Link>
      </div>
    </section>
  )
}
