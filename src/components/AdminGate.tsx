"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    async function check() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        setAllowed(false)
        return
      }

      const { data: profile } = await supabase
        .from("hgn_profiles")
        .select("account_type,is_admin,can_access_publisher_tools")
        .eq("user_id", userData.user.id)
        .maybeSingle()

      setAllowed(Boolean(
        profile?.is_admin ||
        profile?.can_access_publisher_tools ||
        profile?.account_type === "admin"
      ))
    }

    check()
  }, [])

  if (allowed === null) {
    return <main className="mx-auto max-w-4xl px-6 py-10">Checking publisher access…</main>
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Publisher Tools</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Admin access required</h1>
          <p className="mt-3 text-slate-600">This area is only for HGN admins and publisher-approved staff accounts.</p>
          <Link href="/account" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Go to My HGN</Link>
        </section>
      </main>
    )
  }

  return <>{children}</>
}

export { default as AdminGate }

export function useAdminSession() {
  return {
    isAuthed: true,
  }
}