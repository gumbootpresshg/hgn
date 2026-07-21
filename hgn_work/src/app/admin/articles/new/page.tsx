"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { columnSlugFor, hgnColumnOptions } from "@/lib/column-options";

const sections = ["News", "Opinion", "Sports", "Community", "Business", "Obituaries"];

const subcategoriesBySection: Record<string, string[]> = {
  News: ["Local News", "Council", "Education", "Health", "Environment", "Public Safety"],
  Opinion: ["Editorials", "On the Record", "Letters to the Editor", "Columns", "Guest Opinion"],
  Sports: ["Local Sports", "Hockey", "Fishing", "Outdoor Recreation"],
  Community: ["Community", "Arts & Culture", "Events", "Island Life"],
  Business: ["Business", "Real Estate", "Tourism", "Jobs"],
  Obituaries: ["Obituaries", "In Memoriam", "Celebration of Life"],
};

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("News");
  const [subcategory, setSubcategory] = useState("Local News");
  const [columnName, setColumnName] = useState("");
  const [authorName, setAuthorName] = useState("Haida Gwaii News");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const subcategoryOptions = useMemo(() => subcategoriesBySection[section] || [], [section]);
  const showColumnSelector = section === "Opinion" && subcategory === "Columns";

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function changeSection(value: string) {
    setSection(value);
    const nextSubcategory = (subcategoriesBySection[value] || [""])[0];
    setSubcategory(nextSubcategory);
    if (!(value === "Opinion" && nextSubcategory === "Columns")) setColumnName("");
  }

  function changeSubcategory(value: string) {
    setSubcategory(value);
    if (!(section === "Opinion" && value === "Columns")) setColumnName("");
  }

  async function createArticle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("Please enter a title.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const now = new Date().toISOString();
      const baseSlug = slugify(title) || `article-${Date.now()}`;
      const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
      const selectedColumnName = showColumnSelector ? columnName : "";
      const cleanAuthorName = authorName.trim() || "Haida Gwaii News";
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: title.trim(),
          slug,
          section,
          category: section,
          subcategory: subcategory || null,
          column_name: selectedColumnName || null,
          column_slug: selectedColumnName ? columnSlugFor(selectedColumnName) : null,
          status: "draft",
          body: "",
          excerpt: "",
          author_name: cleanAuthorName,
          author: cleanAuthorName,
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();
      if (error) {
        setMessage(error.message);
      } else if (data?.id) {
        router.push(`/admin/articles/${data.id}`);
      }
    } catch (err: any) {
      setMessage(err?.message || "Unable to create article.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href="/admin/articles" className="text-sm font-semibold text-slate-600">
        ← Back to Articles
      </Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Add Article</h1>
        <p className="mt-3 text-slate-600">
          Create a draft article, choose the main section, then choose a more specific category such as On the Record.
          If it is a column, choose the exact column series too.
        </p>
        {message && (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-red-600">
            {message}
          </p>
        )}
        <form onSubmit={createArticle} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Title *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Article title"
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Author</span>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name"
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Main section</span>
            <select
              value={section}
              onChange={(e) => changeSection(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            >
              {sections.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Specific category</span>
            <select
              value={subcategory}
              onChange={(e) => changeSubcategory(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            >
              {subcategoryOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {showColumnSelector ? (
            <label className="block">
              <span className="text-sm font-semibold">Specific column / series</span>
              <select
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3"
              >
                <option value="">Choose a column</option>
                {hgnColumnOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          ) : null}
          <button
            disabled={saving}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Draft Article"}
          </button>
        </form>
      </section>
    </main>
  );
}
