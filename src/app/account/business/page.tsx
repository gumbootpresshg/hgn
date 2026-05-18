"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { businessCategories } from "@/lib/account-types"
import { ensureHgnProfile } from "@/lib/ensure-hgn-profile"

export default function BusinessAccountPage() {
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    setUser(data.user)

    if (data.user) {
      await ensureHgnProfile(data.user)

      const { data: businessData, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (error) setMessage(error.message)
      setBusiness(businessData)
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setMessage("Please sign in before creating a business profile.")
      return
    }

    const form = new FormData(event.currentTarget)
    setSaving(true)
    setMessage("")

    try {
      const payload = {
        user_id: user.id,
        business_name: String(form.get("business_name") || ""),
        category: String(form.get("category") || ""),
        description: String(form.get("description") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || user.email || ""),
        website: String(form.get("website") || ""),
        address: String(form.get("address") || ""),
        community: String(form.get("community") || ""),
        hours: String(form.get("hours") || ""),
        logo_url: String(form.get("logo_url") || ""),
        services_offered: String(form.get("services_offered") || ""),
        facebook_url: String(form.get("facebook_url") || ""),
        instagram_url: String(form.get("instagram_url") || ""),
        status: business?.status || "draft",
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("business_profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single()

      if (error) setMessage(error.message)
      else {
        setBusiness(data)
        setMessage("Business profile saved.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteBusinessProfile() {
    if (!user || !business) return

    if (!window.confirm("Delete this business profile? This removes it from your account and the directory.")) {
      return
    }

    const { error } = await supabase
      .from("business_profiles")
      .delete()
      .eq("id", business.id)
      .eq("user_id", user.id)

    if (error) {
      setMessage(error.message)
    } else {
      setBusiness(null)
      setMessage("Business profile deleted.")
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-10">Loading…</main>
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Business / Organization</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in required</h1>
          <p className="mt-3 text-slate-600">
            Businesses and organizations need one HGN account before creating or managing a business profile.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              Create Business Account
            </Link>
            <Link href="/login" className="rounded-full border px-5 py-3 text-sm font-bold">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Business / Organization</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Business Profile</h1>
        <p className="mt-3 text-slate-600">
          Signed in as {user.email}. This profile powers the business directory, services, events, job postings and marketplace access.
        </p>
        <p className="mt-2 text-sm font-bold text-hgnBlue">
          {business ? "Editing existing business profile" : "Create your business profile"}
        </p>
      </section>

      <form onSubmit={save} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="business_name" required defaultValue={business?.business_name || ""} placeholder="Business name" className="w-full rounded-2xl border px-4 py-3" />

        <select name="category" defaultValue={business?.category || ""} className="w-full rounded-2xl border px-4 py-3">
          <option value="">Choose category</option>
          {businessCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>

        <textarea name="description" defaultValue={business?.description || ""} placeholder="Description" className="w-full rounded-2xl border px-4 py-3" />

        <div className="grid gap-4 md:grid-cols-2">
          <input name="phone" defaultValue={business?.phone || ""} placeholder="Phone" className="rounded-2xl border px-4 py-3" />
          <input name="email" defaultValue={business?.email || user.email || ""} placeholder="Email" className="rounded-2xl border px-4 py-3" />
          <input name="website" defaultValue={business?.website || ""} placeholder="Website" className="rounded-2xl border px-4 py-3" />
          <input name="community" defaultValue={business?.community || ""} placeholder="Community" className="rounded-2xl border px-4 py-3" />
        </div>

        <input name="address" defaultValue={business?.address || ""} placeholder="Address" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="hours" defaultValue={business?.hours || ""} placeholder="Hours" className="w-full rounded-2xl border px-4 py-3" />
        <input name="logo_url" defaultValue={business?.logo_url || ""} placeholder="Logo URL" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="services_offered" defaultValue={business?.services_offered || ""} placeholder="Services offered" className="w-full rounded-2xl border px-4 py-3" />
        <input name="facebook_url" defaultValue={business?.facebook_url || ""} placeholder="Facebook URL" className="w-full rounded-2xl border px-4 py-3" />
        <input name="instagram_url" defaultValue={business?.instagram_url || ""} placeholder="Instagram URL" className="w-full rounded-2xl border px-4 py-3" />

        <div className="flex flex-wrap gap-3">
          <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Saving..." : business ? "Update Business Profile" : "Create Business Profile"}
          </button>

          {business ? (
            <button type="button" onClick={deleteBusinessProfile} className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white">
              Delete Business Profile
            </button>
          ) : null}
        </div>

        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>
    </main>
  )
}
