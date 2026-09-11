"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HgnAuthor, writerSlug } from "@/lib/writers";

const writerTypes = ["staff", "columnist", "contributor", "guest"];

export default function AdminAuthorsPage() {
  const [items, setItems] = useState<HgnAuthor[]>([]);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("hgn_authors")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("display_name", { ascending: true });
    if (error) setMessage(error.message);
    else setItems((data || []) as HgnAuthor[]);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!showInactive && item.is_active === false) return false;
      if (!needle) return true;
      return [item.display_name, item.writer_type, item.short_bio, item.bio]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [items, query, showInactive]);

  async function addAuthor() {
    const displayName = newName.trim();
    if (!displayName) return;
    const { data, error } = await supabase.from("hgn_authors").insert({
      display_name: displayName,
      slug: writerSlug(displayName),
      writer_type: "contributor",
      is_active: true,
      sort_order: items.length * 10 + 10,
    }).select("id").single();
    if (error) setMessage(error.message);
    else {
      setNewName("");
      setExpanded(data?.id || null);
      setMessage("Author added.");
      await load();
    }
  }

  async function updateAuthor(item: HgnAuthor, patch: Partial<HgnAuthor>) {
    const normalized = { ...patch, updated_at: new Date().toISOString() } as Record<string, unknown>;
    if (typeof patch.display_name === "string" && !patch.slug) normalized.slug = writerSlug(patch.display_name);
    const { error } = await supabase.from("hgn_authors").update(normalized).eq("id", item.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Author saved.");
      await load();
    }
  }

  async function uploadPhoto(item: HgnAuthor, file: File | null) {
    if (!file) return;
    setUploadingId(item.id);
    setMessage("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `authors/${item.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("article-images").getPublicUrl(path);
      await updateAuthor(item, { photo_url: data.publicUrl });
    } catch (error: any) {
      setMessage(error?.message || "Photo upload failed.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">HGN Admin</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Authors</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Manage writer identities used in article bylines, columnist relationships and public author pages.</p>
          </div>
          <Link href="/authors" className="hgn-btn-secondary">View public authors</Link>
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add author</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Writer name" className="rounded-2xl border px-4 py-3" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAuthor(); } }} />
          <button type="button" onClick={addAuthor} className="hgn-btn-primary">+ Add author</button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search authors" className="rounded-xl border px-4 py-3" />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive</label>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <button type="button" onClick={() => setExpanded(isOpen ? null : item.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {item.photo_url ? <Image src={item.photo_url} alt="" fill sizes="48px" className="object-cover" /> : <div className="grid h-full place-items-center text-lg font-black text-slate-500">{item.display_name?.slice(0,1)}</div>}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black">{item.display_name}</h2>
                    <p className="text-sm text-slate-500">{item.writer_type || "contributor"} · {item.is_active === false ? "Inactive" : "Active"}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{isOpen ? "Close" : "Edit ▾"}</span>
              </button>

              {isOpen ? (
                <div className="border-t p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display name" value={item.display_name || ""} onBlur={(value) => updateAuthor(item, { display_name: value })} />
                    <Field label="Slug" value={item.slug || ""} onBlur={(value) => updateAuthor(item, { slug: writerSlug(value) })} />
                    <label><span className="text-sm font-semibold">Writer type</span><select defaultValue={item.writer_type || "contributor"} onChange={(e) => updateAuthor(item, { writer_type: e.target.value })} className="mt-2 w-full rounded-xl border px-4 py-3">{writerTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                    <Field label="Sort order" type="number" value={String(item.sort_order || 0)} onBlur={(value) => updateAuthor(item, { sort_order: Number(value) })} />
                    <Field label="Public email (optional)" value={item.public_email || ""} onBlur={(value) => updateAuthor(item, { public_email: value || null })} />
                    <Field label="Website (optional)" value={item.website_url || ""} onBlur={(value) => updateAuthor(item, { website_url: value || null })} />
                  </div>
                  <label className="mt-4 block"><span className="text-sm font-semibold">Short bio</span><textarea defaultValue={item.short_bio || ""} onBlur={(e) => updateAuthor(item, { short_bio: e.target.value || null })} rows={2} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                  <label className="mt-4 block"><span className="text-sm font-semibold">Full public bio</span><textarea defaultValue={item.bio || ""} onBlur={(e) => updateAuthor(item, { bio: e.target.value || null })} rows={5} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <Field label="Photo URL" value={item.photo_url || ""} onBlur={(value) => updateAuthor(item, { photo_url: value || null })} />
                    <label className="hgn-btn-secondary cursor-pointer text-center">{uploadingId === item.id ? "Uploading…" : "Upload photo"}<input type="file" accept="image/*" className="hidden" disabled={uploadingId === item.id} onChange={(e) => uploadPhoto(item, e.target.files?.[0] || null)} /></label>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateAuthor(item, { is_active: item.is_active === false })} className="hgn-btn-secondary">{item.is_active === false ? "Reactivate author" : "Deactivate author"}</button>
                    <Link href={`/authors/${item.slug}`} className="hgn-btn-secondary">View public profile</Link>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Deactivating removes this writer from new article selections but preserves historical bylines and articles.</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function Field({ label, value, onBlur, type = "text" }: { label: string; value: string; type?: string; onBlur: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-semibold">{label}</span><input type={type} defaultValue={value} onBlur={(e) => onBlur(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>;
}
