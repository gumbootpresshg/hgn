"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { uploadArticleImage } from "@/lib/article-image-upload"

type Article = Record<string, any>

export default function EditArticlePage() {
  const params = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from("articles").select("*").eq("id", params.id).single()
    if (error) setMessage(error.message)
    setArticle(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [params.id])

  function patch(field: string, value: any) {
    setArticle((current) => current ? { ...current, [field]: value } : current)
  }


  async function uploadImage(file: File | null) {
    if (!article || !file) return
    setUploading(true)
    setMessage("")

    try {
      const url = await uploadArticleImage(file, article.id)
      patch("image_url", url)
      if (!article.image_alt) {
        patch("image_alt", article.title || "Article image")
      }
      setMessage("Image uploaded. Click Save to keep it on the article.")
    } catch (error: any) {
      setMessage(error?.message || "Image upload failed.")
    } finally {
      setUploading(false)
    }
  }

  async function save(status?: string) {
    if (!article) return
    setSaving(true)
    setMessage("")

    const nextStatus = status || article.status || "draft"
    const body = article.body || article.content || ""

    const payload = {
      title: article.title || "Untitled article",
      slug: article.slug || slugify(article.title || "untitled article"),
      dek: article.dek || article.excerpt || null,
      excerpt: article.excerpt || article.dek || null,
      body,
      content: article.content || body,
      category: article.category || null,
      author: article.author || null,
      image_url: article.image_url || null,
      image_alt: article.image_alt || null,
      image_caption: article.image_caption || null,
      image_credit: article.image_credit || null,
      status: nextStatus,
      published_at: isPublished(nextStatus) ? (article.published_at || new Date().toISOString()) : article.published_at,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("articles").update(payload).eq("id", article.id)
    if (error) setMessage(error.message)
    else setMessage("Saved.")
    setSaving(false)
  }

  if (loading) return <main className="px-6 py-10">Loading...</main>
  if (!article) return <main className="px-6 py-10">Article not found.</main>

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <Link href="/admin/content" className="text-sm font-semibold text-slate-600">← Back to content library</Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Edit Article</h1>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm">{message}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Title" value={article.title || ""} onChange={(value) => patch("title", value)} />
          <Field label="Slug" value={article.slug || ""} onChange={(value) => patch("slug", value)} />
          <Field label="Category" value={article.category || ""} onChange={(value) => patch("category", value)} />
          <Field label="Author" value={article.author || ""} onChange={(value) => patch("author", value)} />
          <Field label="Image URL" value={article.image_url || ""} onChange={(value) => patch("image_url", value)} />
          <Field label="Image alt" value={article.image_alt || ""} onChange={(value) => patch("image_alt", value)} />
          <Field label="Image caption" value={article.image_caption || ""} onChange={(value) => patch("image_caption", value)} />
          <Field label="Image credit" value={article.image_credit || ""} onChange={(value) => patch("image_credit", value)} />
        </div>

        <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
          <h2 className="text-lg font-bold">Upload optimized article photo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload JPG, PNG, WebP, or GIF. For best online speed, use WebP or a compressed JPG under 10MB.
          </p>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => uploadImage(event.target.files?.[0] || null)}
            className="mt-4 block w-full text-sm"
          />
          {article.image_url ? (
            <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.image_url} alt={article.image_alt || "Article image"} className="max-h-80 w-full object-cover" />
            </div>
          ) : null}
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Excerpt / dek</span>
          <textarea value={article.excerpt || article.dek || ""} onChange={(event) => patch("excerpt", event.target.value)} rows={3} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Body</span>
          <textarea value={article.body || article.content || ""} onChange={(event) => patch("body", event.target.value)} rows={16} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Save</button>
          <button disabled={saving} onClick={() => save("published")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Publish</button>
          <button disabled={saving} onClick={() => save("draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Draft</button>
          <button disabled={saving} onClick={() => save("archived")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Archive</button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
    </label>
  )
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function isPublished(status: string) {
  return ["published", "approved", "public", "live", "active"].includes(String(status || "").toLowerCase())
}
