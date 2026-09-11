"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";
import { uploadPublicMedia } from "@/lib/upload-media";

export default function ReaderReporterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "News Tip", title: "", location: "", details: "", media_url: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("Submitting...");

    try {
      const current = e.currentTarget;
      const data = new FormData(current);
      const uploadedUrl = await uploadPublicMedia(data.get("media") as File | null, "reader-reporter");
      const { error } = await supabase.from("reader_reports").insert({ ...form, media_url: uploadedUrl });
      if (error) throw error;
      setMessage("Submitted. Thank you — HGN can review it in the admin dashboard.");
      setForm({ name: "", email: "", phone: "", type: "News Tip", title: "", location: "", details: "", media_url: "" });
      current.reset();
    } catch (err: any) {
      setMessage(err.message || "Submission failed.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto max-w-5xl px-4 py-10">
    <SectionHeader eyebrow="Reader Reporter" title="Send HGN a Tip, Photo, or Video" description="A simple community reporting form for breaking news, events, photos, sports scores, road issues and story ideas." />
    <form onSubmit={submit} className="hgn-card grid gap-4 p-6">
      <div className="grid gap-4 md:grid-cols-2"><label>Name<input value={form.name} onChange={e => set("name", e.target.value)} required /></label><label>Email<input type="email" value={form.email} onChange={e => set("email", e.target.value)} required /></label></div>
      <div className="grid gap-4 md:grid-cols-3"><label>Phone<input value={form.phone} onChange={e => set("phone", e.target.value)} /></label><label>Type<select value={form.type} onChange={e => set("type", e.target.value)}><option>News Tip</option><option>Breaking News</option><option>Photo</option><option>Video</option><option>Sports Score</option><option>Event</option><option>Road / Ferry Issue</option></select></label><label>Location<input value={form.location} onChange={e => set("location", e.target.value)} /></label></div>
      <label>Headline / Short Title<input value={form.title} onChange={e => set("title", e.target.value)} required /></label>
      <label>Details<textarea rows={8} value={form.details} onChange={e => set("details", e.target.value)} required /></label>
      <label>Upload photo, video, or document <span className="text-slate-400">(optional)</span><input name="media" type="file" accept="image/*,video/*,.pdf" /></label>
      <button disabled={saving} className="hgn-btn-primary">{saving ? "Submitting..." : "Submit to HGN"}</button>{message && <p className="font-semibold text-hgnNavy">{message}</p>}
    </form>
  </main>;
}
