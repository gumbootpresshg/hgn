"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ensureHgnProfile } from "@/lib/ensure-hgn-profile"

export default function SignupPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const displayName = String(form.get("display_name") || "").trim()
      const email = String(form.get("email") || "").trim()
      const password = String(form.get("password") || "")
      const confirmPassword = String(form.get("confirm_password") || "")
      const accountType = String(form.get("account_type") || "free_individual")

      if (!email || !password) {
        setMessage("Email and password are required.")
        return
      }

      if (password.length < 8) {
        setMessage("Password must be at least 8 characters.")
        return
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.")
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            account_type: accountType,
          },
        },
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (data.user) {
        await ensureHgnProfile({
          ...data.user,
          email,
        })

        await supabase
          .from("hgn_profiles")
          .upsert(
            {
              user_id: data.user.id,
              email,
              display_name: displayName || email.split("@")[0],
              account_type: accountType,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
      }

      if (data.session) {
        router.push("/account")
      } else {
        setMessage("Account created. Check your email to confirm your account, then sign in.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Create Account</h1>
        <p className="mt-3 text-slate-600">Create one free HGN account for classifieds, newsletters, event submissions and saved stories.</p>

        <form onSubmit={signup} className="mt-6 space-y-4">
          <input name="display_name" placeholder="Name" className="w-full rounded-2xl border px-4 py-3" />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border px-4 py-3" />

          <select name="account_type" className="w-full rounded-2xl border px-4 py-3">
            <option value="free_individual">Free Individual</option>
          </select>

          <input name="password" type="password" required placeholder="Password" className="w-full rounded-2xl border px-4 py-3" />
          <input name="confirm_password" type="password" required placeholder="Confirm password" className="w-full rounded-2xl border px-4 py-3" />

          <button disabled={saving} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Creating..." : "Create Account"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        <p className="mt-5 text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-bold text-hgnBlue">Sign in</Link>
        </p>
      </section>
    </main>
  )
}
