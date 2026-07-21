"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const sections = ["Local News", "Sports", "Editorial", "Letters", "Community", "Business", "Weather", "Visitor Info"];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function PublishPage() {
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => { checkRole(); }, []);

  async function checkRole() {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (!email) return;
    const { data: roleRow } = await supabase.from("user_roles").select("role").ilike("email", email).maybeSingle();
    setAllowed(["admin", "editor"].includes(roleRow?.role));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") || "");
    const status = String(f.get("status") || "draft");
    const payload = {
      title,
      slug: String(f.get("slug") || slugify(title)),
      category: f.get("category"),
      author_name: f.get("author_name"),
      excerpt: f.get("excerpt"),
      body: f.get("body"),
      image_url: f.get("image_url"),
      featured: f.get("featured") === "on",
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("articles").insert(payload);
    setMessage(error ? error.message : "Article saved.");
    if (!error) e.currentTarget.reset();
  }

  if (!allowed) {
    return <main className="mx-auto max-w-xl px-4 py-10"><div className="hgn-card p-6"><h1 className="text-3xl font-black text-hgnNavy">Editor access required</h1><p className="mt-3 text-slate-700">Sign in with an admin or editor account to publish directly.</p><Link href="/login" className="hgn-btn-primary mt-5">Login</Link></div></main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Editor</div><h1 className="mt-2 text-5xl font-black text-hgnNavy">Quick Publish</h1><p className="mt-3 text-slate-700">Create a real article directly from the admin side. Contributors should still use the contributor workflow.</p></div>
        <Link href="/admin" className="hgn-btn-dark">Back to admin</Link>
      </div>
      {message && <div className="hgn-card mt-6 p-4 font-bold text-hgnNavy">{message}</div>}
      <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
        <label>Headline<input name="title" required /></label>
        <label>Slug <input name="slug" placeholder="Auto-generated if blank" /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Section<select name="category">{sections.map((s) => <option key={s}>{s}</option>)}</select></label><label>Author<input name="author_name" placeholder="Haida Gwaii News" /></label></div>
        <label>Summary / Deck<textarea name="excerpt" rows={3} /></label>
        <label>Story Body<textarea name="body" rows={14} required /></label>
        <label>Image URL<input name="image_url" placeholder="https://..." /></label>
        <div className="grid gap-4 md:grid-cols-2"><label>Status<select name="status"><option>draft</option><option>submitted</option><option>published</option></select></label><label className="flex items-center gap-3 pt-8"><input name="featured" type="checkbox" className="w-auto" /> Featured story</label></div>
        <button className="hgn-btn-primary">Save article</button>
      </form>
    </main>
  );
}
