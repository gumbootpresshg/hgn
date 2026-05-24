"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { haidaGwaiiCommunities, marketplaceCategories } from "@/lib/marketplace-options"

const jobCategoryKeywords = ["job", "jobs", "employment", "work", "hiring"]
const realEstateCategoryKeywords = [
  "real-estate",
  "real estate",
  "realestate",
  "rental",
  "rentals",
  "wanted-rentals",
  "wanted rental",
  "property",
  "properties",
  "house",
  "home",
  "housing",
  "land",
  "apartment",
  "suite",
  "commercial",
]
const vehicleCategoryKeywords = [
  "vehicles-boats",
  "vehicle",
  "vehicles",
  "car",
  "cars",
  "truck",
  "trucks",
  "boat",
  "boats",
  "motorcycle",
  "motorcycles",
  "rv",
  "rvs",
  "trailer",
  "trailers",
]

function categoryMatches(value: string, keywords: string[]) {
  const normalized = value.toLowerCase().replace(/_/g, "-")
  return keywords.some((keyword) => normalized.includes(keyword))
}

export default function SubmitClassifiedPage() {
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [preview, setPreview] = useState("")
  const [category, setCategory] = useState(marketplaceCategories[0]?.value || "vehicles-boats")

  const isJobCategory = useMemo(() => categoryMatches(category, jobCategoryKeywords), [category])
  const isRealEstateCategory = useMemo(() => categoryMatches(category, realEstateCategoryKeywords), [category])
  const isVehicleCategory = useMemo(() => categoryMatches(category, vehicleCategoryKeywords), [category])

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
      const selectedCategory = String(form.get("category") || category || "home")
      const photo = form.get("photo") as File | null

      let imageUrl = ""
      if (photo && photo.size > 0) {
        imageUrl = await uploadPhoto(photo)
      }

      const isJob = categoryMatches(selectedCategory, jobCategoryKeywords)
      const isRealEstate = categoryMatches(selectedCategory, realEstateCategoryKeywords)
      const isVehicle = categoryMatches(selectedCategory, vehicleCategoryKeywords)

      const rawPrice = isJob ? "" : String(form.get("price") || "").replace(/[^0-9.]/g, "")
      const priceAmount = rawPrice ? Number(rawPrice) : null
      const autoApproved = Boolean(permissions?.verified_plus)
      const now = new Date().toISOString()

      const payload: Record<string, any> = {
        user_id: user.id,
        owner_email: user.email,
        title: String(form.get("title") || ""),
        price: isJob ? "" : priceAmount ? String(priceAmount) : "",
        price_amount: isJob ? null : priceAmount,
        category: selectedCategory,
        listing_type: isRealEstate ? String(form.get("property_type") || selectedCategory) : isVehicle ? "vehicle" : isJob ? "job" : null,
        town: String(form.get("town") || ""),
        location: String(form.get("town") || ""),
        image_url: imageUrl,
        photo_urls: imageUrl ? [imageUrl] : [],
        description: String(form.get("description") || ""),
        contact_name: String(form.get("contact_name") || user.email || "HGN Marketplace User"),
        contact_email: String(form.get("contact_email") || user.email || ""),
        phone: String(form.get("phone") || ""),
        status: autoApproved ? "active" : "pending",
        updated_at: now,
      }

      if (isJob) {
        payload.employment_type = String(form.get("employment_type") || "")
        payload.rate_of_pay = String(form.get("rate_of_pay") || "")
        payload.contract_amount = String(form.get("contract_amount") || "")
        payload.application_deadline = String(form.get("application_deadline") || "")
        payload.how_to_apply = String(form.get("how_to_apply") || "")
      }

      if (isRealEstate) {
        payload.property_type = String(form.get("property_type") || "")
        payload.property_address = String(form.get("property_address") || "")
        payload.bedrooms = String(form.get("bedrooms") || "")
        payload.bathrooms = String(form.get("bathrooms") || "")
        payload.square_feet = String(form.get("square_feet") || "")
        payload.lot_size = String(form.get("lot_size") || "")
      }

      if (isVehicle) {
        payload.year = String(form.get("year") || "")
        payload.make = String(form.get("make") || "")
        payload.model = String(form.get("model") || "")
        payload.mileage = String(form.get("mileage") || "")
        payload.transmission = String(form.get("transmission") || "")
        payload.colour = String(form.get("colour") || "")
      }

      const { error } = await supabase.from("classifieds").insert(payload)
      if (error) {
        setMessage(error.message)
      } else {
        setMessage(autoApproved ? "Listing posted live." : "Listing submitted for review.")
        setPreview("")
        formElement.reset()
        setCategory(marketplaceCategories[0]?.value || "vehicles-boats")
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
          Choose a category and the form will show the fields needed for jobs, real estate, vehicles, or regular marketplace listings.
        </p>
        {permissions?.verified_plus ? <span className="mt-4 inline-flex rounded-full bg-hgnBlue px-3 py-1 text-xs font-black text-white">Verified Plus</span> : null}
        <Link href="/marketplace/my-listings" className="mt-4 block text-sm font-bold text-hgnBlue">Manage my listings →</Link>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" required placeholder="Title" className="w-full rounded-2xl border px-4 py-3" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Category
            <select
              name="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            >
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

        {isJobCategory ? (
          <section className="rounded-2xl border bg-slate-50 p-4">
            <h2 className="text-lg font-black text-hgnNavy">Job details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">Employment type
                <select name="employment_type" className="mt-2 w-full rounded-2xl border px-4 py-3">
                  <option value="Full time">Full time</option>
                  <option value="Part time">Part time</option>
                  <option value="Contract">Contract</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Casual">Casual</option>
                </select>
              </label>
              <label className="text-sm font-bold">Rate of pay <span className="font-normal text-slate-500">optional</span>
                <input name="rate_of_pay" placeholder="$25/hour, salary, negotiable" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Contract amount / project budget <span className="font-normal text-slate-500">optional</span>
                <input name="contract_amount" placeholder="$1,500 project, negotiable" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Application deadline <span className="font-normal text-slate-500">optional</span>
                <input name="application_deadline" type="date" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold">How to apply <span className="font-normal text-slate-500">optional</span>
              <textarea name="how_to_apply" rows={3} placeholder="Email a resume, call, apply in person, etc." className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
          </section>
        ) : null}

        {isRealEstateCategory ? (
          <section className="rounded-2xl border bg-slate-50 p-4">
            <h2 className="text-lg font-black text-hgnNavy">Real estate details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">Property type
                <select name="property_type" className="mt-2 w-full rounded-2xl border px-4 py-3">
                  <option value="House">House</option>
                  <option value="Rental">Rental</option>
                  <option value="Land">Land</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Apartment / suite">Apartment / suite</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Waterfront">Waterfront</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-sm font-bold">Address / area
                <input name="property_address" placeholder="Address or general area" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <label className="text-sm font-bold">Beds
                <input name="bedrooms" type="number" min="0" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Baths
                <input name="bathrooms" type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Sq. ft.
                <input name="square_feet" type="number" min="0" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Lot size
                <input name="lot_size" placeholder="0.5 acre" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
            </div>
          </section>
        ) : null}

        {isVehicleCategory ? (
          <section className="rounded-2xl border bg-slate-50 p-4">
            <h2 className="text-lg font-black text-hgnNavy">Vehicle / boat details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-bold">Year
                <input name="year" type="number" min="1900" placeholder="2020" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Make
                <input name="make" placeholder="Ford" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Model
                <input name="model" placeholder="F-150" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-bold">Mileage / hours
                <input name="mileage" placeholder="123000 km" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
              <label className="text-sm font-bold">Transmission
                <select name="transmission" className="mt-2 w-full rounded-2xl border px-4 py-3">
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-sm font-bold">Colour
                <input name="colour" placeholder="Blue" className="mt-2 w-full rounded-2xl border px-4 py-3" />
              </label>
            </div>
          </section>
        ) : null}

        {!isJobCategory ? (
          <label className="text-sm font-bold">
            Price
            <div className="mt-2 flex overflow-hidden rounded-2xl border">
              <span className="bg-slate-100 px-4 py-3 font-black text-slate-500">$</span>
              <input name="price" inputMode="decimal" placeholder="0" className="min-w-0 flex-1 px-4 py-3 outline-none" />
            </div>
          </label>
        ) : null}

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
