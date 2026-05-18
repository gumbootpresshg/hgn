"use client"

import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const password = String(form.get("password") || "")
      const confirmPassword = String(form.get("confirm_password") || "")

      if (password.length < 8) {
        setMessage("Password must be at least 8 characters.")
        return
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.")
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      setMessage(error ? error.message : "Password updated. You can now sign in.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Choose New Password</h1>

        <form onSubmit={updatePassword} className="mt-6 space-y-4">
          <input name="password" type="password" required placeholder="New password" className="w-full rounded-2xl border px-4 py-3" />
          <input name="confirm_password" type="password" required placeholder="Confirm new password" className="w-full rounded-2xl border px-4 py-3" />
          <button disabled={saving} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        <Link href="/login" className="mt-5 inline-flex text-sm font-bold text-hgnBlue">Sign in</Link>
      </section>
    </main>
  )
}
