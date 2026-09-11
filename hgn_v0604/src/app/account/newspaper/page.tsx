"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { officialColumnNames, slugify } from "@/lib/article-routing"
import { marketplaceCategories, haidaGwaiiCommunities } from "@/lib/marketplace-options"

const newsSections = ["Local News", "Sports", "Mountie Minute", "Editorials", "Letters to the Editor", "Obituaries", "Island Lens"]

export default function BuildMyNewspaperPage() {
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: perms } = await supabase.from("member_permissions").select("*").eq("user_id", data.user.id).maybeSingle()
        setPermissions(perms)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return setMessage("Please sign in first.")

    const form = new FormData(event.currentTarget)
    const payload = {
      user_id: user.id,
      title: String(form.get("title") || "My HGN"),
      column_slugs: form.getAll("columns").map(String),
      news_sections: form.getAll("sections").map(String),
      classified_categories: form.getAll("classifieds").map(String),
      weather_location: String(form.get("weather_location") || ""),
      include_events: form.get("include_events") === "on",
      include_obituaries: form.get("include_obituaries") === "on",
      include_island_lens: form.get("include_island_lens") === "on",
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("member_newspaper_preferences").upsert(payload, { onConflict: "user_id" })
    setMessage(error ? error.message : "Custom newspaper preferences saved.")
  }

  if (loading) return <main className="mx-auto max-w-4xl px-6 py-10">Loading…</main>

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Sign in required</h1>
          <p className="mt-3 text-slate-600">Sign in to build your custom HGN newspaper.</p>
        </section>
      </main>
    )
  }

  const paid = Boolean(permissions?.is_paid_member || permissions?.verified_plus)

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Coming Later</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Build My Newspaper</h1>
        <p className="mt-3 text-slate-600">
          This custom newspaper builder is hidden from the main account menu while paid membership tools are being perfected.
        </p>
      </section>

      {!paid ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-2xl font-black">Not open yet</h2>
          <p className="mt-3 text-sm leading-7">
            Paid membership tools are not public yet. This page can stay in testing until you are ready to launch it.
          </p>
        </section>
      ) : null}

      <form onSubmit={save} className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" defaultValue="My HGN" className="w-full rounded-2xl border px-4 py-3" />

        <Picker title="Columns" name="columns" items={officialColumnNames.map((name) => ({ label: name, value: slugify(name) }))} />
        <Picker title="News & Community Sections" name="sections" items={newsSections.map((name) => ({ label: name, value: name }))} />
        <Picker title="Classified Categories" name="classifieds" items={marketplaceCategories.map((item) => ({ label: item.label, value: item.value }))} />

        <label className="block text-sm font-bold">
          Weather Location
          <select name="weather_location" className="mt-2 w-full rounded-2xl border px-4 py-3">
            {haidaGwaiiCommunities.map((community) => <option key={community} value={community}>{community}</option>)}
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="include_events" defaultChecked /> Events</label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="include_obituaries" defaultChecked /> Obituaries</label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="include_island_lens" /> Island Lens</label>
        </div>

        <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Save My Newspaper</button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>
    </main>
  )
}

function Picker({ title, name, items }: { title: string; name: string; items: { label: string; value: string }[] }) {
  return (
    <section>
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <label key={item.value} className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold">
            <input type="checkbox" name={name} value={item.value} />
            {item.label}
          </label>
        ))}
      </div>
    </section>
  )
}
