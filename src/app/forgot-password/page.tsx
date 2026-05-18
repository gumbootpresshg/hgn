"use client"

import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const email = String(form.get("email") || "").trim()
      const origin = window.location.origin

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      })

      setMessage(error ? error.message : "Password reset email sent.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Reset Password</h1>
        <p className="mt-3 text-slate-600">Enter your email and we’ll send a reset link.</p>

        <form onSubmit={sendReset} className="mt-6 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border px-4 py-3" />
          <button disabled={saving} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        <Link href="/login" className="mt-5 inline-flex text-sm font-bold text-hgnBlue">Back to sign in</Link>
      </section>
    </main>
  )
}
