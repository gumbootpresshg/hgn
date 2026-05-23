"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Admin add article page
 *
 * Allows editors to quickly create a draft article. Upon submission the
 * article is created in the `articles` table with a generated slug and
 * the user is redirected to the full article editor (/admin/articles/[id]).
 */
export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("News");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
      // Add a random suffix to ensure slug uniqueness
      const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: title.trim(),
          slug,
          section,
          category: section,
          status: "draft",
          body: "",
          excerpt: "",
          author_name: "Haida Gwaii News",
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
          Create a draft article, then edit, publish, feature or delete it in the full
          editor.
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
            <span className="text-sm font-semibold">Section</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            >
              <option>News</option>
              <option>Opinion</option>
              <option>Sports</option>
              <option>Community</option>
              <option>Business</option>
              <option>Obituaries</option>
            </select>
          </label>
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
