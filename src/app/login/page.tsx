"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ensureHgnProfile } from "@/lib/ensure-hgn-profile"

export default function LoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadExistingUser() {
      const { data } = await supabase.auth.getUser()
      if (data.user) await ensureHgnProfile(data.user)
    }
    loadExistingUser()
  }, [])

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const email = String(form.get("email") || "").trim()
      const password = String(form.get("password") || "")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (data.user) {
        await ensureHgnProfile(data.user)
      }

      router.push("/account")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Sign In</h1>
        <p className="mt-3 text-slate-600">Sign in to manage classifieds, newsletters, events, subscriptions, business tools and publisher access.</p>

        <form onSubmit={login} className="mt-6 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border px-4 py-3" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-2xl border px-4 py-3" />

          <button disabled={saving} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link href="/signup" className="font-bold text-hgnBlue">Create account</Link>
          <Link href="/forgot-password" className="font-bold text-hgnBlue">Forgot password?</Link>
        </div>
      </section>
    </main>
  )
}
