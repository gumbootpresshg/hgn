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
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)

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
    setCanResendConfirmation(false)
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
        setCanResendConfirmation(/confirm/i.test(error.message || ""))
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

  async function resendConfirmation() {
    const form = document.querySelector("form")
    const values = form ? new FormData(form) : null
    const email = String(values?.get("email") || "").trim()
    const password = String(values?.get("password") || "")
    if (!email || !password) { setMessage("Enter your email and password first, then choose resend confirmation."); return }
    setSaving(true)
    try {
      const response = await fetch("/api/auth/resend-confirmation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      const result = await response.json().catch(() => ({}))
      setMessage(result.sent ? "Confirmation email sent. Check your inbox and spam folder, then use the link to sign in." : "We could not resend a confirmation email. Please contact HGN for help.")
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

        {message ? <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><p>{message}</p>{canResendConfirmation ? <button type="button" onClick={() => void resendConfirmation()} disabled={saving} className="mt-3 font-bold text-hgnBlue hover:underline disabled:opacity-50">Resend confirmation email</button> : null}</div> : null}

        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link href="/signup" className="font-bold text-hgnBlue">Create account</Link>
          <Link href="/forgot-password" className="font-bold text-hgnBlue">Forgot password?</Link>
        </div>
      </section>
    </main>
  )
}
