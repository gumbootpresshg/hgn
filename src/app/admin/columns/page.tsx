"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Columnist = Record<string, any>

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AdminColumnsPage() {
  const [items, setItems] = useState<Columnist[]>([])
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")

  async function load() {
    const { data, error } = await supabase
      .from("columnists")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("display_name", { ascending: true })

    if (error) setMessage(error.message)
    setItems(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addColumnist() {
    const cleanName = name.trim()
    if (!cleanName) return

    const { error } = await supabase.from("columnists").insert({
      name: cleanName,
      display_name: cleanName,
      slug: slugify(cleanName),
      category_match: cleanName,
      section_match: cleanName,
      sort_order: items.length * 10 + 10,
      is_active: true,
    })

    if (error) setMessage(error.message)
    else {
      setName("")
      await load()
    }
  }

  async function updateItem(item: Columnist, patch: Partial<Columnist>) {
    const { error } = await supabase
      .from("columnists")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", item.id)

    if (error) setMessage(error.message)
    else await load()
  }

  async function deleteItem(item: Columnist) {
    if (!window.confirm(`Remove ${item.display_name || item.name} from the Columns menu?`)) return

    const { error } = await supabase
      .from("columnists")
      .delete()
      .eq("id", item.id)

    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Columns Menu</h1>
        <p className="mt-3 text-slate-600">
          Add, remove, hide, sort, and connect columnists/columns to the public Columns menu.
        </p>
        {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add column</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Column or columnist name"
            className="rounded-2xl border px-4 py-3"
          />
          <button onClick={addColumnist} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            Add
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Display name" value={item.display_name || item.name || ""} onChange={(value) => updateItem(item, { display_name: value, name: value })} />
              <Field label="Slug" value={item.slug || ""} onChange={(value) => updateItem(item, { slug: slugify(value) })} />
              <Field label="Author match" value={item.author_match || ""} onChange={(value) => updateItem(item, { author_match: value })} />
              <Field label="Category match" value={item.category_match || ""} onChange={(value) => updateItem(item, { category_match: value })} />
              <Field label="Section match" value={item.section_match || ""} onChange={(value) => updateItem(item, { section_match: value })} />
              <Field label="Sort order" type="number" value={String(item.sort_order || 0)} onChange={(value) => updateItem(item, { sort_order: Number(value) })} />
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Description</span>
              <textarea
                value={item.description || ""}
                onChange={(event) => updateItem(item, { description: event.target.value })}
                rows={2}
                className="mt-2 w-full rounded-2xl border px-4 py-3"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => updateItem(item, { is_active: !item.is_active })}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide"
              >
                {item.is_active ? "Hide from menu" : "Show in menu"}
              </button>

              <button
                onClick={() => deleteItem(item)}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border px-4 py-3"
      />
    </label>
  )
}
