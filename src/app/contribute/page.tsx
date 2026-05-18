"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadPublicImage } from "@/lib/upload-media";

const categories = [
  "News",
  "Sports",
  "Opinion",
  "Letters",
  "Community",
  "Business",
  "Events",
  "Obituaries",
  "Visitor Info",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCaseName(value: string) {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function ContributorEditor() {
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      alert("Please login first.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const status = String(form.get("status") || "submitted");
    const category = String(form.get("category") || "News");
    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadPublicImage(form.get("image") as File | null, "article-submissions") || null;
    } catch (err: any) {
      alert(err.message || "Image upload failed.");
      return;
    }
    const authorName = titleCaseName(String(form.get("author_name") || user.email || "Haida Gwaii News"));

    const payload = {
      title,
      slug: slugify(title),
      excerpt: String(form.get("excerpt") || ""),
      body: String(form.get("body") || ""),
      category,
      section: category,
      image_url: imageUrl,
      status,
      featured: form.get("featured") === "on",
      front_page_main: form.get("front_page_main") === "on",
      sort_order: Number(form.get("sort_order") || 0),
      author_id: user.id,
      author_name: authorName,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("articles").insert(payload);
    if (error) alert(error.message);
    else setMessage("Article saved. Editors can review and place it on the front page.");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-black text-hgnNavy">Contributor Article Editor</h1>
      <p className="mt-3 text-slate-700">
        Write, draft, and submit stories. Editors control publication, front-page placement, and feature status.
      </p>

      <form onSubmit={submit} className="hgn-card mt-6 grid gap-4 p-6">
        <label>
          Title
          <input name="title" required />
        </label>

        <label>
          Author full name
          <input name="author_name" placeholder="First Last" />
        </label>

        <label>
          Category / section
          <select name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Image, optional
          <input name="image" type="file" accept="image/*" />
        </label>

        <label>
          Excerpt
          <textarea name="excerpt" rows={3} />
        </label>

        <label>
          Article body
          <textarea name="body" rows={14} required />
        </label>

        <div className="grid gap-3 rounded-xl bg-slate-50 p-4">
          <label>
            Status
            <select name="status">
              <option value="draft">Draft</option>
              <option value="submitted">Submit for editor review</option>
              <option value="published">Publish now if allowed</option>
            </select>
          </label>

          <label>
            Front page sort order
            <input name="sort_order" type="number" defaultValue="0" />
          </label>

          <label className="flex items-center gap-2">
            <input className="w-auto" type="checkbox" name="featured" /> Featured story
          </label>

          <label className="flex items-center gap-2">
            <input className="w-auto" type="checkbox" name="front_page_main" /> Front page main story
          </label>
        </div>

        <button className="hgn-btn-primary">Save article</button>
        {message && <p className="font-semibold text-hgnNavy">{message}</p>}
      </form>
    </main>
  );
}
