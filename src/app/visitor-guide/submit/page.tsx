"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadPublicImage } from "@/lib/upload-media";

const towns = ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Island-wide"];
const categories = ["Stay", "Eat", "Explore", "Services", "Shops", "Tours", "Emergency", "Transportation"];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export default function SubmitVisitorListing() {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setDone(false);
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") || "").trim();
    let imageUrl = "";
    try {
      imageUrl = await uploadPublicImage(f.get("image") as File | null, "visitor-guide");
    } catch (err: any) {
      alert(err.message || "Image upload failed.");
      setSaving(false);
      return;
    }

    const payload = {
      title,
      slug: slugify(title),
      category: f.get("category"),
      town: f.get("town"),
      address: f.get("address"),
      phone: f.get("phone"),
      email: f.get("email"),
      website: f.get("website"),
      hours: f.get("hours"),
      description: f.get("description"),
      submitter_name: f.get("submitter_name"),
      submitter_email: f.get("submitter_email"),
      image_url: imageUrl,
      status: "pending",
    };
    const { error } = await supabase.from("visitor_listings").insert(payload);
    if (error) alert(error.message); else { setDone(true); e.currentTarget.reset(); }
    setSaving(false);
  }

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <Link href="/visitor-guide" className="text-sm font-black text-hgnBlue">← Visitor Guide</Link>
    <h1 className="mt-3 text-4xl font-black text-hgnNavy">Submit visitor information</h1>
    <p className="mt-3 text-slate-700">Add or update a business, attraction, visitor service, tour, restaurant, emergency contact or travel tip. HGN editors review before it appears publicly.</p>
    <form onSubmit={submit} className="hgn-card mt-8 grid gap-4 p-6">
      {done && <div className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">Submitted for editor review.</div>}
      <label>Listing title<input name="title" required placeholder="Business, place, service or visitor tip" /></label>
      <div className="grid gap-4 md:grid-cols-2"><label>Category<select name="category" required>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Town<select name="town" required>{towns.map(t => <option key={t}>{t}</option>)}</select></label></div>
      <label>Description<textarea name="description" rows={7} required placeholder="What should visitors know?" /></label>
      <label>Address or area<input name="address" placeholder="Optional" /></label>
      <div className="grid gap-4 md:grid-cols-2"><label>Phone<input name="phone" type="tel" /></label><label>Email<input name="email" type="email" /></label></div>
      <label>Website / booking link<input name="website" type="url" placeholder="https://" /></label>
      <label>Hours / seasonal notes<input name="hours" placeholder="Open daily, summer only, call ahead, etc." /></label>
      <label>Image, optional<input name="image" type="file" accept="image/*" /></label>
      <div className="grid gap-4 md:grid-cols-2"><label>Your name<input name="submitter_name" required /></label><label>Your email<input name="submitter_email" type="email" required /></label></div>
      <button disabled={saving} className="hgn-btn-primary">{saving ? "Submitting..." : "Submit for approval"}</button>
    </form>
  </main>
}
