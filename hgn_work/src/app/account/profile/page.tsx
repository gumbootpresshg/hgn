"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { accountTypes } from "@/lib/account-types"

export default function AccountProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: profileData } = await supabase.from("hgn_profiles").select("*").eq("user_id", data.user.id).maybeSingle()
        setProfile(profileData)
      }
    }
    load()
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const form = new FormData(event.currentTarget)
    const payload = {
      user_id: user.id,
      email: user.email,
      display_name: String(form.get("display_name") || ""),
      account_type: String(form.get("account_type") || "free_individual"),
      phone: String(form.get("phone") || ""),
      community: String(form.get("community") || ""),
      newsletter_opt_in: form.get("newsletter_opt_in") === "on",
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("hgn_profiles").upsert(payload, { onConflict: "user_id" }).select().single()
    if (error) setMessage(error.message)
    else {
      setProfile(data)
      setMessage("Profile saved.")
    }
  }

  if (!user) return <main className="mx-auto max-w-xl px-6 py-10">Please sign in.</main>

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">My Profile</h1>
      </section>

      <form onSubmit={save} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="display_name" defaultValue={profile?.display_name || ""} placeholder="Display name" className="w-full rounded-2xl border px-4 py-3" />
        <select name="account_type" defaultValue={profile?.account_type || "free_individual"} className="w-full rounded-2xl border px-4 py-3">
          {accountTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
        <input name="phone" defaultValue={profile?.phone || ""} placeholder="Phone" className="w-full rounded-2xl border px-4 py-3" />
        <input name="community" defaultValue={profile?.community || ""} placeholder="Community" className="w-full rounded-2xl border px-4 py-3" />
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="newsletter_opt_in" defaultChecked={Boolean(profile?.newsletter_opt_in)} />
          Opt into newsletters
        </label>
        <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Save Profile</button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>
    </main>
  )
}
