"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const fallbackCats = ["Vehicles", "Rentals", "Jobs", "Services", "Equipment", "Firewood", "Fishing Gear", "Local Crafts", "Buy / Sell", "Community Notice"];
const fallbackTowns = ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Other / Island-wide"];

async function uploadListingPhoto(file: File | null) {
  if (!file || file.size === 0) return "";
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `marketplace/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hgn-media").upload(filePath, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("hgn-media").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function NewMarketplaceListing() {
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [cats, setCats] = useState(fallbackCats);
  const [towns, setTowns] = useState(fallbackTowns);

  useEffect(() => {
    async function loadSettings() {
      const [{ data: catRows }, { data: townRows }] = await Promise.all([
        supabase.from("marketplace_categories").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("marketplace_towns").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (catRows?.length) setCats(catRows.map((r: any) => r.name));
      if (townRows?.length) setTowns(townRows.map((r: any) => r.name));
    }
    loadSettings();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const f = new FormData(e.currentTarget);
      const file = f.get("photo") as File | null;
      const image_url = await uploadListingPhoto(file);
      const payload = {
        title: f.get("title"), category: f.get("category"), location: f.get("location"), description: f.get("description"), price: f.get("price"), contact_name: f.get("contact_name"), contact_email: f.get("contact_email"), phone: f.get("phone"), image_url, status: "pending",
      };
      const { error } = await supabase.from("classifieds").insert(payload);
      if (error) {
        const response = await fetch("/api/submit/classified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || error.message);
      }
      setOk(true);
    } catch (err: any) { alert(err.message || "Upload failed"); }
    finally { setSaving(false); }
  }

  if (ok) return <main className="mx-auto max-w-2xl px-4 py-10"><div className="hgn-card p-6"><h1 className="text-3xl font-black text-hgnNavy">Listing submitted</h1><p className="mt-3 text-slate-700">HGN will review it before publishing.</p><Link className="hgn-btn-primary mt-5" href="/marketplace">Back to marketplace</Link></div></main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Marketplace</div>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Post a Marketplace Listing</h1>
      <p className="mt-3 text-slate-700">Add a town, phone number, upload photos, and submit your listing for HGN review. Works well from phones.</p>
      <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
        <label>Title<input name="title" required placeholder="Example: Firewood for sale, 2008 truck, rental wanted" /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Category<select name="category">{cats.map(c => <option key={c}>{c}</option>)}</select></label><label>Town / Location<select name="location" required>{towns.map(t => <option key={t}>{t}</option>)}</select></label></div>
        <label>Description<textarea name="description" rows={7} required placeholder="Details, condition, pickup/delivery info..." /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Price<input name="price" placeholder="$100 or Contact seller" /></label><label>Phone<input name="phone" type="tel" inputMode="tel" placeholder="250-000-0000" /></label></div>
        <div className="grid gap-4 md:grid-cols-2"><label>Contact Name<input name="contact_name" required /></label><label>Email<input name="contact_email" type="email" required /></label></div>
        <label>Photo<input name="photo" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; setPreview(file ? URL.createObjectURL(file) : ""); }} /></label>
        {preview && <img src={preview} alt="Listing preview" className="max-h-72 rounded-2xl object-cover" />}
        <button disabled={saving} className="hgn-btn-primary">{saving ? "Uploading..." : "Submit listing"}</button>
      </form>
    </main>
  );
}
