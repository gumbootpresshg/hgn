"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

async function uploadPhoto(file: File | null) {
  if (!file || file.size === 0) return "";
  const ext = file.name.split(".").pop() || "jpg";
  const path = `reader-photos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hgn-media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("hgn-media").getPublicUrl(path);
  return data.publicUrl;
}

export default function SubmitPhotoPage() {
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    try { const f = new FormData(e.currentTarget); const photo_url = await uploadPhoto(f.get("photo") as File | null); const { error } = await supabase.from("photo_submissions").insert({ name: f.get("name"), email: f.get("email"), caption: f.get("caption"), photo_url, status: "new" }); if (error) alert(error.message); else setDone(true); }
    catch (err:any) { alert(err.message || "Upload failed"); }
    finally { setSaving(false); }
  }
  return <main className="mx-auto max-w-3xl px-4 py-10"><div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Reader photos</div><h1 className="mt-2 text-5xl font-black text-hgnNavy">Submit a Photo</h1><p className="mt-3 text-slate-700">Upload community photos, sports photos, weather shots or photo-of-the-week entries.</p>{done ? <div className="hgn-card mt-6 p-6"><h2 className="text-2xl font-black text-hgnNavy">Photo submitted</h2><p className="mt-2 text-slate-700">Thanks. HGN will review it before publishing.</p></div> : <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6"><div className="grid gap-4 md:grid-cols-2"><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label></div><label>Caption / details<textarea name="caption" rows={5} /></label><label>Photo<input name="photo" type="file" accept="image/*" required onChange={(e)=>{const file=e.target.files?.[0]; setPreview(file ? URL.createObjectURL(file) : "");}} /></label>{preview && <img src={preview} alt="Preview" className="max-h-80 rounded-2xl object-cover" />}<button disabled={saving} className="hgn-btn-primary">{saving ? "Uploading..." : "Submit photo"}</button></form>}</main>;
}
