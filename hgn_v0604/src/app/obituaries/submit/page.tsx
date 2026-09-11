"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadPublicImage } from "@/lib/upload-media";

export default function SubmitObituaryPage() {
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.currentTarget;
      const f = new FormData(form);
      const photoUrl = await uploadPublicImage(f.get("photo") as File | null, "obituaries");
      const { error } = await supabase.from("obituaries").insert({
        name: f.get("name"),
        dates: f.get("dates"),
        details: f.get("details"),
        image_url: photoUrl,
        photo_url: photoUrl,
        contact_name: f.get("contact_name"),
        contact_email: f.get("contact_email"),
        contact_phone: f.get("contact_phone"),
        status: "pending",
      });
      if (error) throw error;
      setOk("Obituary information submitted. Online obituaries are free; HGN will review and follow up if you also want the $100 print option.");
      setPreview("");
      form.reset();
    } catch (err: any) {
      alert(err.message || "Obituary submission failed.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <Link href="/obituaries" className="text-sm font-bold text-hgnBlue">Back to Obituaries</Link>
    <h1 className="mt-4 text-5xl font-black text-hgnNavy">Submit an Obituary</h1>
    <p className="mt-3 text-slate-700">Send obituary information to the paper. Online obituaries are free. Print obituaries are $100. You can upload a photo directly; no image URL is needed.</p>
    <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
      <label>Name<input name="name" required /></label>
      <label>Dates / Service Information<input name="dates" placeholder="Birth/death dates or service date" /></label>
      <label>Photo, optional<input name="photo" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; setPreview(file ? URL.createObjectURL(file) : ""); }} /></label>
      {preview && <img src={preview} alt="Preview" className="max-h-80 rounded-2xl object-cover" />}
      <label>Obituary details<textarea name="details" rows={10} required /></label>
      <div className="grid gap-4 md:grid-cols-3"><label>Your name<input name="contact_name" /></label><label>Email<input name="contact_email" type="email" /></label><label>Phone<input name="contact_phone" /></label></div>
      <button disabled={saving} className="hgn-btn-primary">{saving ? "Submitting..." : "Submit Obituary"}</button>
      {ok && <p className="font-bold text-hgnNavy">{ok}</p>}
    </form>
  </main>;
}
