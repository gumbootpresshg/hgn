"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadPublicImage } from "@/lib/upload-media";

export default function SubmitObituary() {
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.currentTarget;
      const f = new FormData(form);
      const details = String(f.get("details") || "");
      const photo_url = await uploadPublicImage(f.get("photo") as File | null, "obituaries");
      const payload = {
        name: f.get("name"),
        dates: f.get("dates"),
        details,
        notice: details,
        contact_name: f.get("contact_name"),
        contact_email: f.get("contact_email"),
        contact_phone: f.get("contact_phone"),
        photo_url,
        image_url: photo_url,
        newsletter_opt_in: f.get("newsletter_opt_in") === "on",
        status: "pending",
      };
      const { error } = await supabase.from("obituaries").insert(payload);
      if (error) throw error;
      setOk(true);
      setPreview("");
      window.setTimeout(() => form?.reset?.(), 0);
    } catch (err: any) {
      alert(err.message || "Obituary submission failed.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-5xl font-black text-hgnNavy">Submit an Obituary</h1>
    <p className="mt-3 text-slate-700">Send obituary information to Haida Gwaii News. Online obituaries are free. Print obituaries are $100. You can upload a photo directly; no image URL is needed.</p>
    <form onSubmit={submit} className="hgn-card mt-8 grid gap-4 p-6">
      {ok && <div className="rounded-xl bg-green-50 p-3 font-bold text-green-800">Obituary information submitted. Online obituaries are free; HGN will review it before publishing.</div>}
      <label>Name<input name="name" required /></label>
      <label>Dates<input name="dates" placeholder="1948-2026" /></label>
      <label>Obituary details<textarea name="details" rows={9} required /></label>
      <label>Photo, optional<input name="photo" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; setPreview(file ? URL.createObjectURL(file) : ""); }} /></label>
      {preview && <img src={preview} alt="Preview" className="max-h-80 rounded-2xl object-cover" />}
      <div className="grid gap-4 md:grid-cols-2"><label>Contact name<input name="contact_name" required /></label><label>Email<input name="contact_email" type="email" required /></label></div>
      <label>Phone<input name="contact_phone" type="tel" /></label>
      <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold"><input className="w-auto" type="checkbox" name="newsletter_opt_in" /> Keep me updated with HGN newsletters</label>
      <button disabled={saving} className="hgn-btn-primary">{saving ? "Submitting..." : "Submit to HGN"}</button>
    </form>
  </main>;
}
