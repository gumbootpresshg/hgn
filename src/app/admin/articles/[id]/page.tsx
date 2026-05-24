"use client";

import { columnSlugFor, hgnColumnOptions } from "@/lib/column-options"
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Article = Record<string, any>;

const categories = ["News", "Sports", "Opinion", "Letters", "Community", "Business", "Events", "Obituaries", "Visitor Info"];
const statuses = ["draft", "submitted", "published", "archived"];

const subcategoriesByCategory: Record<string, string[]> = {
  News: ["Local News", "Council", "Education", "Health", "Environment", "Public Safety"],
  Sports: ["Local Sports", "Hockey", "Fishing", "Outdoor Recreation"],
  Opinion: ["Editorials", "On the Record", "Letters to the Editor", "Columns", "Guest Opinion"],
  Letters: ["Letters to the Editor", "Community Letters"],
  Community: ["Community", "Arts & Culture", "Events", "Island Life"],
  Business: ["Business", "Real Estate", "Tourism", "Jobs"],
  Events: ["Events", "Community Calendar"],
  Obituaries: ["Obituaries", "In Memoriam", "Celebration of Life"],
  "Visitor Info": ["Visitor Info", "Travel", "Ferries", "Maps"],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
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
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const blankArticle: Article = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  author_name: "Haida Gwaii News",
  category: "News",
  section: "News",
  subcategory: "Local News",
  column_name: "",
  column_slug: "",
  image_url: "",
  status: "draft",
  featured: false,
  front_page_main: false,
  sort_order: 0,
  published_at: null,
};

export default function ArticleEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const isNew = id === "new";

  const [article, setArticle] = useState<Article>(blankArticle);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  const previewUrl = useMemo(() => article.slug ? `/articles/${article.slug}` : "#", [article.slug]);
  const subcategoryOptions = useMemo(() => subcategoriesByCategory[article.category || "News"] || [], [article.category]);
  const showColumnSelector = article.category === "Opinion" && article.subcategory === "Columns";

  useEffect(() => {
    if (isNew) return;
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadArticle() {
    setLoading(true);
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
    if (error) setMessage(error.message);
    else setArticle({ ...blankArticle, ...(data || {}) });
    setLoading(false);
  }

  function update(field: string, value: any) {
    setArticle((prev) => ({ ...prev, [field]: value }));
  }

  function updateCategory(value: string) {
    const defaultSubcategory = (subcategoriesByCategory[value] || [""])[0];
    setArticle((prev) => ({
      ...prev,
      category: value,
      section: value,
      subcategory: prev.category === value ? prev.subcategory : defaultSubcategory,
      column_name: value === "Opinion" && (prev.category === value ? prev.subcategory : defaultSubcategory) === "Columns" ? prev.column_name : "",
      column_slug: value === "Opinion" && (prev.category === value ? prev.subcategory : defaultSubcategory) === "Columns" ? prev.column_slug : "",
    }));
  }

  function updateSubcategory(value: string) {
    setArticle((prev) => ({
      ...prev,
      subcategory: value,
      column_name: prev.category === "Opinion" && value === "Columns" ? prev.column_name : "",
      column_slug: prev.category === "Opinion" && value === "Columns" ? prev.column_slug : "",
    }));
  }

  function updateColumnName(value: string) {
    setArticle((prev) => ({
      ...prev,
      column_name: value,
      column_slug: value ? columnSlugFor(value) : "",
    }));
  }

  function insertHtml(start: string, end = "") {
    const textarea = document.getElementById("article-body") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const before = article.body.slice(0, textarea.selectionStart);
    const selected = article.body.slice(textarea.selectionStart, textarea.selectionEnd);
    const after = article.body.slice(textarea.selectionEnd);
    update("body", `${before}${start}${selected}${end}${after}`);
    setTimeout(() => textarea.focus(), 0);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setMessage("");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
    const filePath = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage.from("article-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setMessage(`Image upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("article-images").getPublicUrl(filePath);
    update("image_url", data.publicUrl);
    setMessage("Image uploaded and attached to article.");
    setUploading(false);
  }

  async function save(nextStatus?: string) {
    setSaving(true);
    setMessage("");

    const title = String(article.title || "").trim();
    if (!title) {
      setMessage("Title is required.");
      setSaving(false);
      return;
    }

    const status = nextStatus || article.status || "draft";
    const slug = article.slug?.trim() || slugify(title);
    const category = article.category || "News";
    const subcategory = article.subcategory || null;
    const columnName = category === "Opinion" && subcategory === "Columns" ? (article.column_name || "") : "";
    // Prepare the body for saving. If the user hasn't entered any HTML tags,
    // convert each newline into its own <p>...</p> paragraph. This lets
    // editors type plain text and simply press Enter to start new
    // paragraphs rather than manually inserting <p> tags.
    const rawBody = article.body || ""
    let processedBody: string
    if (rawBody && !rawBody.match(/<[^>]+>/)) {
      // Explicitly type the 'line' parameter so that TypeScript doesn't infer it as 'any'.
      processedBody = rawBody
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => `<p>${line}</p>`)
        .join("")
    } else {
      processedBody = rawBody
    }

    const payload = {
      title,
      slug,
      excerpt: article.excerpt || "",
      body: processedBody,
      author_name: titleCaseName(article.author_name || "Haida Gwaii News"),
      category,
      section: category,
      subcategory,
      column_name: columnName || null,
      column_slug: columnName ? columnSlugFor(columnName) : null,
      image_url: article.image_url || null,
      status,
      featured: !!article.featured,
      front_page_main: !!article.front_page_main,
      sort_order: Number(article.sort_order || 0),
      published_at: status === "published" ? (article.published_at || new Date().toISOString()) : article.published_at,
    };

    let savedId = id;
    let error;
    if (isNew) {
      const result = await supabase.from("articles").insert(payload).select("id").single();
      error = result.error;
      savedId = result.data?.id;
    } else {
      const result = await supabase.from("articles").update(payload).eq("id", id);
      error = result.error;
    }

    if (error) setMessage(error.message);
    else {
      setMessage(status === "published" ? "Article published." : "Article saved.");
      setArticle((prev) => ({ ...prev, ...payload }));
      if (isNew && savedId) router.replace(`/admin/articles/${savedId}`);
    }
    setSaving(false);
  }

  async function deleteArticle() {
    if (isNew) return router.push("/admin/articles");
    if (!confirm("Delete this article permanently?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return setMessage(error.message);
    router.push("/admin/articles");
  }

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-10">Loading editor...</main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/admin/articles" className="text-sm font-black text-hgnBlue">← Back to article manager</Link>
          <h1 className="mt-2 text-4xl font-black text-hgnNavy md:text-5xl">{isNew ? "New Article" : "Edit Article"}</h1>
          <p className="mt-2 text-slate-600">A WordPress-style editor for titles, copy, photos, categories, and front-page placement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && article.slug && <Link href={previewUrl} target="_blank" className="hgn-btn-dark">Open public page</Link>}
          <button onClick={() => setPreview((v) => !v)} className="hgn-btn-dark">{preview ? "Hide preview" : "Preview"}</button>
          <button onClick={() => save("draft")} disabled={saving} className="hgn-btn-primary">Save draft</button>
          <button onClick={() => save("published")} disabled={saving} className="hgn-btn-primary">Publish</button>
        </div>
      </div>

      {message && <div className="hgn-card mt-6 p-4 font-bold text-hgnNavy">{message}</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-5">
          <div className="hgn-card grid gap-4 p-5">
            <label>
              Headline
              <input value={article.title || ""} onChange={(e) => update("title", e.target.value)} onBlur={() => !article.slug && update("slug", slugify(article.title || ""))} />
            </label>

            <label>
              URL slug
              <input value={article.slug || ""} onChange={(e) => update("slug", slugify(e.target.value))} />
            </label>

            <label>
              Subtitle / excerpt
              <textarea value={article.excerpt || ""} onChange={(e) => update("excerpt", e.target.value)} rows={3} />
            </label>
          </div>

          <div className="hgn-card p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => insertHtml("<p>", "</p>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Paragraph</button>
              <button type="button" onClick={() => insertHtml("<h2>", "</h2>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Heading</button>
              <button type="button" onClick={() => insertHtml("<strong>", "</strong>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Bold</button>
              <button type="button" onClick={() => insertHtml("<em>", "</em>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Italic</button>
              <button type="button" onClick={() => insertHtml('<blockquote>', "</blockquote>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Quote</button>
              <button type="button" onClick={() => insertHtml('<a href="https://">', "</a>")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">Link</button>
            </div>
            <label>
              Article body
              <textarea id="article-body" value={article.body || ""} onChange={(e) => update("body", e.target.value)} rows={22} />
            </label>
          </div>

          {preview && (
            <article className="hgn-card p-6 md:p-10">
              <div className="text-sm font-black uppercase tracking-wide text-hgnBlue">{article.subcategory || article.category || "News"}</div>
              <h2 className="mt-2 text-4xl font-black text-hgnNavy">{article.title || "Untitled"}</h2>
              <p className="mt-2 border-b pb-4 text-sm text-slate-500">By {article.author_name || "Haida Gwaii News"}</p>
              {article.image_url && <img src={article.image_url} alt="" className="mt-6 max-h-[520px] w-full rounded-xl object-cover" />}
              <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: article.body || "" }} />
            </article>
          )}
        </section>

        <aside className="grid content-start gap-5">
          <div className="hgn-card grid gap-4 p-5">
            <h2 className="text-2xl font-black text-hgnNavy">Publishing</h2>
            <label>
              Status
              <select value={article.status || "draft"} onChange={(e) => update("status", e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Category
              <select value={article.category || "News"} onChange={(e) => updateCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Specific category
              <select value={article.subcategory || ""} onChange={(e) => updateSubcategory(e.target.value)}>
                <option value="">None</option>
                {subcategoryOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            {showColumnSelector ? (
              <label>
                Specific column / series
                <select value={article.column_name || ""} onChange={(e) => updateColumnName(e.target.value)}>
                  <option value="">Choose a column</option>
                  {hgnColumnOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            ) : null}
            <label>
              Author full name
              <input value={article.author_name || ""} onChange={(e) => update("author_name", e.target.value)} onBlur={(e) => update("author_name", titleCaseName(e.target.value))} />
            </label>
            <label>
              Published date
              <input type="datetime-local" value={article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ""} onChange={(e) => update("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
            </label>
          </div>

          <div className="hgn-card grid gap-4 p-5">
            <h2 className="text-2xl font-black text-hgnNavy">Photo</h2>
            {article.image_url && <img src={article.image_url} alt="" className="max-h-64 w-full rounded-xl object-cover" />}
            <label>
              Upload photo
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            <label>
              Uploaded image URL
              <input value={article.image_url || ""} readOnly placeholder="Upload a photo above" />
            </label>
            {uploading && <p className="font-bold text-hgnBlue">Uploading photo...</p>}
          </div>

          <div className="hgn-card grid gap-3 p-5">
            <h2 className="text-2xl font-black text-hgnNavy">Front page</h2>
            <label className="flex items-center gap-2">
              <input className="w-auto" type="checkbox" checked={!!article.front_page_main} onChange={(e) => update("front_page_main", e.target.checked)} />
              Main front-page story
            </label>
            <label className="flex items-center gap-2">
              <input className="w-auto" type="checkbox" checked={!!article.featured} onChange={(e) => update("featured", e.target.checked)} />
              Featured story
            </label>
            <label>
              Sort order
              <input type="number" value={article.sort_order || 0} onChange={(e) => update("sort_order", Number(e.target.value))} />
            </label>
          </div>

          <div className="hgn-card grid gap-3 p-5">
            <button onClick={() => save()} disabled={saving} className="hgn-btn-primary">Save changes</button>
            <button onClick={() => save("published")} disabled={saving} className="hgn-btn-primary">Publish now</button>
            <button onClick={deleteArticle} className="hgn-btn-dark">Delete article</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
