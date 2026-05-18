"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadPublicImage } from "@/lib/upload-media";

export default function PhotoWeek() {
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setOk("");

    try {
      const form = e.currentTarget;
      const f = new FormData(form);
      const photo_url = await uploadPublicImage(f.get("photo") as File | null, "reader-photos");
      const payload = {
        name: f.get("name"),
        email: f.get("email"),
        caption: f.get("caption"),
        photo_url,
        status: "new",
      };
      const { error } = await supabase.from("photo_submissions").insert(payload);
      if (error) throw error;
      setOk("Photo submitted. HGN will review it before publishing.");
      setPreview("");
      form.reset();
    } catch (err: any) {
      alert(err.message || "Photo upload failed.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-5xl font-black text-hgnNavy">Photo of the Week</h1>
    <p className="mt-3 text-slate-700">Upload a photo directly from your phone or computer. No old website image URL is needed.</p>
    <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
      <label>Name<input name="name" /></label>
      <label>Email<input name="email" type="email" /></label>
      <label>Photo<input name="photo" type="file" accept="image/*" required onChange={(e) => { const file = e.target.files?.[0]; setPreview(file ? URL.createObjectURL(file) : ""); }} /></label>
      {preview && <img src={preview} alt="Preview" className="max-h-80 rounded-2xl object-cover" />}
      <label>Caption<textarea name="caption" rows={5} /></label>
      <button disabled={saving} className="hgn-btn-primary">{saving ? "Uploading..." : "Submit photo"}</button>
      {ok && <p className="font-bold text-hgnNavy">{ok}</p>}
    </form>
  </main>;
}
