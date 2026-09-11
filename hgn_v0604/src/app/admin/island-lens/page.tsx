"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminIslandLensPage() {
  const [items, setItems] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function load() {
    const { data, error } = await supabase.from("island_lens_items").select("*").order("created_at", { ascending: false })
    if (error) setMessage(error.message)
    else setItems(data || [])
  }

  useEffect(() => { load() }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)

    const photoUrls = String(form.get("photo_urls") || "").split("\n").map((url) => url.trim()).filter(Boolean)
    const videoUrls = String(form.get("video_urls") || "").split("\n").map((url) => url.trim()).filter(Boolean)

    const { error } = await supabase.from("island_lens_items").insert({
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      gallery_intro: String(form.get("gallery_intro") || ""),
      gallery_body: String(form.get("gallery_body") || ""),
      media_type: String(form.get("media_type") || "gallery"),
      media_url: String(form.get("media_url") || ""),
      thumbnail_url: String(form.get("thumbnail_url") || photoUrls[0] || ""),
      photo_urls: photoUrls,
      video_urls: videoUrls,
      community: String(form.get("community") || ""),
      credit: String(form.get("credit") || ""),
      status: String(form.get("status") || "draft"),
      featured: form.get("featured") === "on",
    })

    if (error) setMessage(error.message)
    else {
      setMessage("Island Lens gallery added.")
      formElement.reset()
      load()
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Island Lens</h1>
        <p className="mt-3 text-slate-600">Create full galleries with header text, story text, photos and videos.</p>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" required placeholder="Gallery title" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="description" placeholder="Short description/card summary" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="gallery_intro" rows={3} placeholder="Header/intro text, optional" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="gallery_body" rows={6} placeholder="Full story/text with gallery, optional" className="w-full rounded-2xl border px-4 py-3" />

        <select name="media_type" className="rounded-2xl border px-4 py-3">
          <option value="gallery">Gallery</option>
          <option value="photo">Single Photo</option>
          <option value="video">Video</option>
          <option value="mixed">Photos + Videos</option>
        </select>

        <input name="media_url" placeholder="Main media URL, optional" className="w-full rounded-2xl border px-4 py-3" />
        <input name="thumbnail_url" placeholder="Thumbnail URL, optional. Defaults to first photo." className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="photo_urls" rows={6} placeholder="Photo URLs, one per line" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="video_urls" rows={4} placeholder="Video URLs, one per line" className="w-full rounded-2xl border px-4 py-3" />
        <input name="community" placeholder="Community" className="w-full rounded-2xl border px-4 py-3" />
        <input name="credit" placeholder="Credit" className="w-full rounded-2xl border px-4 py-3" />

        <select name="status" className="rounded-2xl border px-4 py-3">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="featured" /> Featured</label>
        <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Add Gallery</button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{item.status}</p>
            <h2 className="mt-2 text-xl font-black">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.media_type} · {(item.photo_urls || []).length} photos</p>
          </article>
        ))}
      </section>
    </main>
  )
}
