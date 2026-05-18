"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MarketplacePostGatePage() {
  const [checking, setChecking] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setLoggedIn(true)
        window.location.href = "/submit-classified"
      } else {
        setLoggedIn(false)
      }
      setChecking(false)
    }

    check()
  }, [])

  if (checking) return <main className="mx-auto max-w-xl px-6 py-10">Checking login…</main>

  if (!loggedIn) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Marketplace</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Log in to post</h1>
          <p className="mt-3 text-slate-600">To reduce fake ads and spam, HGN Marketplace requires a free login.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Sign in / Create account</Link>
            <Link href="/marketplace" className="rounded-full border px-5 py-3 text-sm font-bold">Back to Marketplace</Link>
          </div>
        </section>
      </main>
    )
  }

  return null
}
