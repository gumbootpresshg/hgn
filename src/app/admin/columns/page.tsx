"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HgnAuthor, HgnColumn, writerSlug } from "@/lib/writers";

export default function AdminColumnsPage() {
  const [items, setItems] = useState<HgnColumn[]>([]);
  const [authors, setAuthors] = useState<HgnAuthor[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const [{ data: columns, error }, { data: writerRows }] = await Promise.all([
      supabase.from("columnists").select("*").order("sort_order", { ascending: true }).order("display_name", { ascending: true }),
      supabase.from("hgn_authors").select("id,display_name,slug,is_active,writer_type").order("display_name", { ascending: true }),
    ]);
    if (error) setMessage(error.message);
    setItems((columns || []) as HgnColumn[]);
    setAuthors((writerRows || []) as HgnAuthor[]);
  }

  useEffect(() => { load(); }, []);

  const authorById = useMemo(() => new Map(authors.map((author) => [author.id, author])), [authors]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!showInactive && item.is_active === false) return false;
      if (!needle) return true;
      const authorName = item.author_id ? authorById.get(item.author_id)?.display_name : item.author_match;
      return [item.display_name, item.name, authorName, item.description].some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [items, query, showInactive, authorById]);

  async function addColumn() {
    const cleanName = name.trim();
    if (!cleanName) return;
    const { data, error } = await supabase.from("columnists").insert({
      name: cleanName,
      display_name: cleanName,
      slug: writerSlug(cleanName),
      category_match: cleanName,
      section_match: cleanName,
      sort_order: items.length * 10 + 10,
      is_active: true,
    }).select("id").single();
    if (error) setMessage(error.message);
    else {
      setName("");
      setExpanded(data?.id || null);
      setMessage("Column added.");
      await load();
    }
  }

  async function updateItem(item: HgnColumn, patch: Partial<HgnColumn>) {
    const normalized: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
    if (typeof patch.display_name === "string" && !patch.slug) {
      normalized.name = patch.display_name;
      normalized.slug = writerSlug(patch.display_name);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "author_id")) {
      const selected = patch.author_id ? authorById.get(patch.author_id) : null;
      normalized.author_match = selected?.display_name || null;
    }
    const { error } = await supabase.from("columnists").update(normalized).eq("id", item.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Column saved.");
      await load();
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">HGN Admin</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Columns</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Manage column series and connect each one to an HGN author. Details stay collapsed until you need them.</p>
          </div>
          <Link href="/admin/authors" className="hgn-btn-secondary">Manage authors</Link>
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add column</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Column name, e.g. Life on the Gwaii" className="rounded-2xl border px-4 py-3" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addColumn(); } }} />
          <button type="button" onClick={addColumn} className="hgn-btn-primary">+ Add column</button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search columns or writers" className="rounded-xl border px-4 py-3" />
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} /> Show inactive</label>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          const author = item.author_id ? authorById.get(item.author_id) : undefined;
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <button type="button" onClick={() => setExpanded(isOpen ? null : item.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black">{item.display_name || item.name}</h2>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${item.is_active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{item.is_active === false ? "Inactive" : "Active"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Writer: {author?.display_name || item.author_match || "Not assigned"}</p>
                </div>
                <span className="shrink-0 text-sm font-bold">{isOpen ? "Close" : "Edit ▾"}</span>
              </button>

              {isOpen ? (
                <div className="border-t p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Column name" value={item.display_name || item.name || ""} onBlur={(value) => updateItem(item, { display_name: value })} />
                    <Field label="Slug" value={item.slug || ""} onBlur={(value) => updateItem(item, { slug: writerSlug(value) })} />
                    <label className="block"><span className="text-sm font-semibold">Writer</span><select value={item.author_id || ""} onChange={(event) => updateItem(item, { author_id: event.target.value || null })} className="mt-2 w-full rounded-xl border px-4 py-3"><option value="">Not assigned</option>{authors.filter((writer) => writer.is_active !== false || writer.id === item.author_id).map((writer) => <option key={writer.id} value={writer.id}>{writer.display_name}</option>)}</select></label>
                    <Field label="Sort order" type="number" value={String(item.sort_order || 0)} onBlur={(value) => updateItem(item, { sort_order: Number(value) })} />
                    <Field label="Category match (legacy compatibility)" value={item.category_match || ""} onBlur={(value) => updateItem(item, { category_match: value || null })} />
                    <Field label="Section match (legacy compatibility)" value={item.section_match || ""} onBlur={(value) => updateItem(item, { section_match: value || null })} />
                    <Field label="Column photo URL (optional)" value={item.photo_url || ""} onBlur={(value) => updateItem(item, { photo_url: value || null })} />
                  </div>
                  <label className="mt-4 block"><span className="text-sm font-semibold">Column description</span><textarea defaultValue={item.description || ""} onBlur={(event) => updateItem(item, { description: event.target.value || null })} rows={3} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                  <label className="mt-4 block"><span className="text-sm font-semibold">Column bio / about text</span><textarea defaultValue={item.bio || ""} onBlur={(event) => updateItem(item, { bio: event.target.value || null })} rows={4} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateItem(item, { is_active: item.is_active === false })} className="hgn-btn-secondary">{item.is_active === false ? "Reactivate column" : "Deactivate column"}</button>
                    {item.slug ? <Link href={`/columns/${item.slug}`} className="hgn-btn-secondary">View public column</Link> : null}
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Columns are deactivated rather than deleted so historical article links remain intact.</p>
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
  return <label className="block"><span className="text-sm font-semibold">{label}</span><input type={type} defaultValue={value} onBlur={(event) => onBlur(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>;
}
