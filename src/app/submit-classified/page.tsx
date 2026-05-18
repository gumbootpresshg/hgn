"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { haidaGwaiiCommunities, marketplaceCategories } from "@/lib/marketplace-options"

export default function SubmitClassifiedPage() {
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [preview, setPreview] = useState("")

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        const { data: perms } = await supabase
          .from("member_permissions")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle()
        setPermissions(perms)
      }

      setChecking(false)
    }
    check()
  }, [])

  async function uploadPhoto(file: File) {
    if (!user) return ""

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const path = `${user.id}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from("marketplace-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage.from("marketplace-photos").getPublicUrl(path)
    return data.publicUrl
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      if (!user) {
        setMessage("Please log in before posting.")
        return
      }

      const formElement = event.currentTarget
      const form = new FormData(formElement)
      const category = String(form.get("category") || "home")
      const photo = form.get("photo") as File | null

      // Free HGN accounts can post in every classified category.

      let imageUrl = ""
      if (photo && photo.size > 0) {
        imageUrl = await uploadPhoto(photo)
      }

      const rawPrice = String(form.get("price") || "").replace(/[^0-9.]/g, "")
      const priceAmount = rawPrice ? Number(rawPrice) : null
      const autoApproved = Boolean(permissions?.verified_plus)

      const payload = {
        user_id: user.id,
        owner_email: user.email,
        title: String(form.get("title") || ""),
        price: priceAmount ? String(priceAmount) : "",
        price_amount: priceAmount,
        category,
        town: String(form.get("town") || ""),
        image_url: imageUrl,
        photo_urls: imageUrl ? [imageUrl] : [],
        description: String(form.get("description") || ""),
        contact_name: String(form.get("contact_name") || user.email || "HGN Marketplace User"),
        contact_email: String(form.get("contact_email") || user.email || ""),
        phone: String(form.get("phone") || ""),
        status: autoApproved ? "active" : "pending",
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("classifieds").insert(payload)
      if (error) {
        setMessage(error.message)
      } else {
        setMessage(autoApproved ? "Listing posted live." : "Listing submitted for review.")
        setPreview("")
        formElement.reset()
      }
    } catch (error: any) {
      setMessage(error?.message || "Unable to submit listing.")
    } finally {
      setSaving(false)
    }
  }

  if (checking) return <main className="mx-auto max-w-3xl px-6 py-10">Checking login…</main>

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black tracking-tight">Log in to post</h1>
          <p className="mt-3 text-slate-600">HGN Marketplace requires login to reduce fake ads and help people manage their listings.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Log in / Sign up</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Marketplace</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Post a Listing</h1>
        <p className="mt-3 text-slate-600">
          Free HGN accounts can post in every classified category. Listings are reviewed before appearing publicly unless the account is verified.
        </p>
        {permissions?.verified_plus ? <span className="mt-4 inline-flex rounded-full bg-hgnBlue px-3 py-1 text-xs font-black text-white">Verified Plus</span> : null}
        <Link href="/marketplace/my-listings" className="mt-4 block text-sm font-bold text-hgnBlue">Manage my listings →</Link>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" required placeholder="Title" className="w-full rounded-2xl border px-4 py-3" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Category
            <select name="category" required className="mt-2 w-full rounded-2xl border px-4 py-3">
              {marketplaceCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold">
            Community / Town
            <select name="town" required className="mt-2 w-full rounded-2xl border px-4 py-3">
              {haidaGwaiiCommunities.map((town) => <option key={town} value={town}>{town}</option>)}
            </select>
          </label>
        </div>

        <label className="text-sm font-bold">
          Price
          <div className="mt-2 flex overflow-hidden rounded-2xl border">
            <span className="bg-slate-100 px-4 py-3 font-black text-slate-500">$</span>
            <input name="price" inputMode="decimal" placeholder="0" className="min-w-0 flex-1 px-4 py-3 outline-none" />
          </div>
        </label>

        <label className="text-sm font-bold">
          Photo
          <input
            name="photo"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file) setPreview(URL.createObjectURL(file))
            }}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-72 rounded-3xl border object-cover" />
        ) : null}

        <textarea name="description" required placeholder="Description" rows={6} className="w-full rounded-2xl border px-4 py-3" />
        <input name="contact_name" placeholder="Contact name" className="w-full rounded-2xl border px-4 py-3" />
        <input name="contact_email" type="email" defaultValue={user.email || ""} placeholder="Contact email" className="w-full rounded-2xl border px-4 py-3" />
        <input name="phone" placeholder="Phone, optional" className="w-full rounded-2xl border px-4 py-3" />

        <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
          {saving ? "Submitting..." : permissions?.verified_plus ? "Post Listing" : "Submit for Review"}
        </button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}
      </form>
    </main>
  )
}
