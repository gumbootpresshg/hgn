"use client";

import { columnSlugFor } from "@/lib/column-options"
import { useEditorialPeople } from "@/lib/use-editorial-people"
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { generateSeoFields, seoReadiness } from "@/lib/seo-generator";

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


function toNewsroomDateTimeInput(value: string | null | undefined, timeZone: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function fromNewsroomDateTimeInput(value: string, timeZone: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, ys, ms, ds, hs, mins] = match;
  const desiredUtc = Date.UTC(Number(ys), Number(ms) - 1, Number(ds), Number(hs), Number(mins));
  let guess = desiredUtc;
  for (let i = 0; i < 3; i += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(guess));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
    const representedUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
    guess += desiredUtc - representedUtc;
  }
  return new Date(guess).toISOString();
}

function excerptFromArticleBody(value: string, maxLength = 220) {
  const plain = String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " " )
    .replace(/<style[\s\S]*?<\/style>/gi, " " )
    .replace(/<[^>]+>/g, " " )
    .replace(/&nbsp;/gi, " " )
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " " )
    .trim();

  if (!plain) return "";

  const sentences = plain.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [plain];
  let excerpt = "";
  for (const sentence of sentences) {
    const candidate = `${excerpt}${excerpt ? " " : ""}${sentence.trim()}`;
    if (candidate.length > maxLength && excerpt) break;
    excerpt = candidate;
    if (excerpt.length >= 120) break;
  }

  if (excerpt.length <= maxLength) return excerpt;
  const clipped = excerpt.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" " );
  return `${clipped.slice(0, lastSpace > 120 ? lastSpace : maxLength).trim()}…`;
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
  writer_id: null,
  category: "News",
  section: "News",
  subcategory: "Local News",
  column_name: "",
  column_slug: "",
  image_url: "",
  image_alt: "",
  image_caption: "",
  image_credit: "",
  front_page_photo: false,
  status: "draft",
  featured: false,
  front_page_main: false,
  sort_order: 0,
  published_at: null,
  seo_title: "",
  meta_description: "",
  social_title: "",
  social_description: "",
  og_image_url: "",
  seo_keywords: [],
  google_news_headline: "",
  google_news_include: true,
  seo_generated_at: null,
};

async function notifyIndexNow(path: string) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/distribution/indexnow", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: path }),
    });
  } catch {}
}

export default function ArticleEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const isNew = id === "new";

  const [article, setArticle] = useState<Article>(blankArticle);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveAction, setSaveAction] = useState<"save" | "publish" | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const draftReadyRef = useRef(false);
  const editVersionRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [newsroomTimezone, setNewsroomTimezone] = useState("America/Vancouver");
  const { authors, columns } = useEditorialPeople();

  const previewUrl = useMemo(() => article.slug ? `/articles/${article.slug}` : "#", [article.slug]);
  const draftKey = useMemo(() => `hgn:article-editor-draft:${id}`, [id]);
  const subcategoryOptions = useMemo(() => subcategoriesByCategory[article.category || "News"] || [], [article.category]);
  const showColumnSelector = article.category === "Opinion" && article.subcategory === "Columns";
  const readiness = useMemo(() => seoReadiness(article), [article]);

  useEffect(() => {
    if (isNew) return;
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!draftReadyRef.current || !isDirty) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          article,
          savedLocallyAt: new Date().toISOString(),
        }));
      } catch {
        // Local draft protection is best-effort; database saves remain authoritative.
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [article, draftKey, isDirty]);

  useEffect(() => {
    const persistDraftImmediately = () => {
      if (!draftReadyRef.current || !isDirty) return;
      try {
        localStorage.setItem(draftKey, JSON.stringify({ article, savedLocallyAt: new Date().toISOString() }));
      } catch {
        // Best-effort recovery copy only.
      }
    };
    const warnIfDirty = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      persistDraftImmediately();
      event.preventDefault();
      event.returnValue = "";
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") persistDraftImmediately();
    };
    window.addEventListener("beforeunload", warnIfDirty);
    window.addEventListener("pagehide", persistDraftImmediately);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", warnIfDirty);
      window.removeEventListener("pagehide", persistDraftImmediately);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [article, draftKey, isDirty]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const response = await fetch("/api/admin/publishing-settings", { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const result = await response.json().catch(() => ({}));
      if (result.settings?.newsroom_timezone) setNewsroomTimezone(result.settings.newsroom_timezone);
    })();
  }, []);

  async function loadArticle() {
    setLoading(true);
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
    if (error) setMessage(error.message);
    else {
      const row = data || {};
      const databaseArticle = {
        ...blankArticle,
        ...row,
        author_name: row.author_name || row.author || blankArticle.author_name,
      };
      let nextArticle = databaseArticle;
      try {
        const rawDraft = localStorage.getItem(draftKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          const localTime = new Date(draft?.savedLocallyAt || 0).getTime();
          const databaseTime = new Date(row.updated_at || row.created_at || 0).getTime();
          if (draft?.article && localTime > databaseTime) {
            nextArticle = { ...databaseArticle, ...draft.article };
            setIsDirty(true);
            setDraftRecovered(true);
            setMessage("Recovered unsaved changes from this browser.");
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      } catch {
        // Ignore corrupt or unavailable local draft storage.
      }
      setArticle(nextArticle);
      if (!draftRecovered) setLastSavedAt(row.updated_at ? new Date(row.updated_at) : null);
      draftReadyRef.current = true;
    }
    setLoading(false);
  }

  function markEdited() {
    editVersionRef.current += 1;
    setIsDirty(true);
  }

  function update(field: string, value: any) {
    setArticle((prev) => ({ ...prev, [field]: value }));
    markEdited();
  }

  function updateCategory(value: string) {
    markEdited();
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
    markEdited();
    setArticle((prev) => ({
      ...prev,
      subcategory: value,
      column_name: prev.category === "Opinion" && value === "Columns" ? prev.column_name : "",
      column_slug: prev.category === "Opinion" && value === "Columns" ? prev.column_slug : "",
    }));
  }

  function updateColumnName(value: string) {
    markEdited();
    const selectedColumn = columns.find((item) => (item.display_name || item.name || "") === value);
    const selectedWriter = selectedColumn?.author_id ? authors.find((item) => item.id === selectedColumn.author_id) : undefined;
    setArticle((prev) => ({
      ...prev,
      column_name: value,
      column_slug: value ? (selectedColumn?.slug || columnSlugFor(value)) : "",
      writer_id: selectedWriter?.id || prev.writer_id || null,
      author_name: selectedWriter?.display_name || prev.author_name,
      author: selectedWriter?.display_name || prev.author,
    }));
  }


  function generateExcerpt() {
    const excerpt = excerptFromArticleBody(article.body || "");
    if (!excerpt) {
      setMessage("Paste or write the article body first, then generate the subtitle / excerpt.");
      return;
    }
    update("excerpt", excerpt);
    setMessage("Subtitle / excerpt created from the article. Review it before publishing.");
  }

  function generateAllSeo() {
    if (!String(article.title || "").trim()) {
      setMessage("Add the headline before generating SEO.");
      return;
    }
    const generated = generateSeoFields(article);
    setArticle((prev) => ({
      ...prev,
      ...generated,
      slug: prev.slug?.trim() || generated.slug,
      og_image_url: prev.image_url || prev.og_image_url || generated.og_image_url,
      image_alt: prev.image_alt?.trim() || generated.image_alt,
    }));
    markEdited();
    setMessage("SEO, Google News and social fields generated. Review them, then save or publish.");
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
    setSaveAction(nextStatus === "published" ? "publish" : "save");
    setMessage("");

    const title = String(article.title || "").trim();
    if (!title) {
      setMessage("Title is required.");
      setSaving(false);
      setSaveAction(null);
      return;
    }

    const saveVersion = editVersionRef.current;
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
      author_name: titleCaseName(article.author_name || article.author || "Haida Gwaii News"),
      author: titleCaseName(article.author_name || article.author || "Haida Gwaii News"),
      writer_id: article.writer_id || null,
      category,
      section: category,
      subcategory,
      column_name: columnName || null,
      column_slug: columnName ? columnSlugFor(columnName) : null,
      image_url: article.image_url || null,
      image_alt: article.image_alt || null,
      image_caption: article.image_caption || null,
      image_credit: article.image_credit || null,
      seo_title: article.seo_title || null,
      meta_description: article.meta_description || null,
      social_title: article.social_title || null,
      social_description: article.social_description || null,
      og_image_url: article.og_image_url || article.image_url || null,
      seo_keywords: Array.isArray(article.seo_keywords) ? article.seo_keywords : String(article.seo_keywords || "").split(",").map((item) => item.trim()).filter(Boolean),
      google_news_headline: article.google_news_headline || article.seo_title || title,
      google_news_include: article.google_news_include !== false,
      seo_generated_at: article.seo_generated_at || null,
      updated_at: new Date().toISOString(),
      front_page_photo: !!article.front_page_photo,
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
      if (payload.front_page_photo && savedId) {
        const { error: clearPhotoError } = await supabase
          .from("articles")
          .update({ front_page_photo: false })
          .eq("front_page_photo", true)
          .neq("id", savedId);
        if (clearPhotoError) {
          setMessage(`Article saved, but the previous front-page photo could not be cleared: ${clearPhotoError.message}`);
          setSaving(false);
          setSaveAction(null);
          return;
        }
      }
      const savedAt = new Date();
      const changedWhileSaving = editVersionRef.current !== saveVersion;
      setMessage(status === "published" ? "Article published successfully." : "Article saved successfully.");
      if (!changedWhileSaving) {
        setArticle((prev) => ({ ...prev, ...payload }));
        setIsDirty(false);
        setDraftRecovered(false);
        try { localStorage.removeItem(draftKey); } catch {}
      } else {
        setIsDirty(true);
        setMessage(`${status === "published" ? "Article published" : "Article saved"}, but you made newer edits while it was saving. Those edits are still protected and need another save.`);
      }
      setLastSavedAt(savedAt);
      if (status === "published" && slug) void notifyIndexNow(`/articles/${slug}`);
      if (isNew && savedId) router.replace(`/admin/articles/${savedId}`);
    }
    setSaving(false);
    setSaveAction(null);
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
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex flex-wrap gap-2">
            {!isNew && article.slug && <Link href={previewUrl} target="_blank" className="hgn-btn-dark">Open public page</Link>}
            <button onClick={() => setPreview((v) => !v)} className="hgn-btn-dark">{preview ? "Hide preview" : "Preview"}</button>
            <button onClick={() => save("draft")} disabled={saving} className="hgn-btn-primary">{saving && saveAction === "save" ? "Saving…" : "Save draft"}</button>
            <button onClick={() => save("published")} disabled={saving} className="hgn-btn-primary">{saving && saveAction === "publish" ? "Publishing…" : "Publish"}</button>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.08em]">
            {isDirty ? (
              <span className="text-amber-700">● Unsaved changes · protected in this browser</span>
            ) : lastSavedAt ? (
              <span className="text-emerald-700">✓ Saved {lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            ) : null}
          </div>
        </div>
      </div>

      {message && <div role="status" aria-live="polite" className="hgn-card mt-6 border-l-4 border-l-hgnRed p-4 font-bold text-hgnNavy">{message}</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="grid content-start gap-5">
          <div className="hgn-card space-y-4 p-5">
            <label className="block">
              <span className="block">Headline</span>
              <input className="mt-1" value={article.title || ""} onChange={(e) => update("title", e.target.value)} onBlur={() => !article.slug && update("slug", slugify(article.title || ""))} />
            </label>

            <label className="block">
              <span className="block">URL slug</span>
              <input className="mt-1" value={article.slug || ""} onChange={(e) => update("slug", slugify(e.target.value))} />
            </label>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="article-excerpt" className="block">Subtitle / excerpt</label>
                <button type="button" onClick={generateExcerpt} className="hgn-btn-dark px-3 py-2 text-xs">
                  Generate from article
                </button>
              </div>
              <textarea
                id="article-excerpt"
                className="mt-1"
                value={article.excerpt || ""}
                onChange={(e) => update("excerpt", e.target.value)}
                rows={3}
                placeholder="Write a short deck, or generate one from the article body below."
              />
              <p className="mt-1 text-xs font-normal text-slate-500">Uses the opening sentences from the article as a starting point. You can edit it before saving.</p>
            </div>
          </div>

          <div className="hgn-card p-5">
            <div className="mb-3">
              <h2 className="text-2xl font-black text-hgnNavy">Article body</h2>
              <p className="mt-1 text-sm text-slate-600">Write visually here. Paste from Word or Google Docs and paragraphs will stay as paragraphs.</p>
            </div>
            <RichTextEditor value={article.body || ""} onChange={(html) => update("body", html)} />
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
                  {columns.map((item) => { const label = item.display_name || item.name || "Column"; return <option key={item.id} value={label}>{label}</option>; })}
                </select>
              </label>
            ) : null}
            <label>
              Author
              <select
                value={article.writer_id || ""}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const writer = authors.find((item) => item.id === nextId);
                  markEdited();
                  setArticle((prev) => ({
                    ...prev,
                    writer_id: nextId || null,
                    author_name: writer?.display_name || prev.author_name || "Haida Gwaii News",
                    author: writer?.display_name || prev.author || "Haida Gwaii News",
                  }));
                }}
              >
                <option value="">Legacy / Haida Gwaii News byline</option>
                {authors.map((writer) => <option key={writer.id} value={writer.id}>{writer.display_name}</option>)}
              </select>
              <span className="mt-1 flex items-center justify-between gap-2 text-xs font-normal text-slate-500">
                <span>{article.author_name || "Haida Gwaii News"}</span>
                <Link href="/admin/authors" className="font-bold underline">Manage authors</Link>
              </span>
            </label>
            <label>
              Published date
              <span className="ml-2 text-xs font-normal text-slate-500">{newsroomTimezone}</span>
              <input type="datetime-local" value={toNewsroomDateTimeInput(article.published_at, newsroomTimezone)} onChange={(e) => update("published_at", fromNewsroomDateTimeInput(e.target.value, newsroomTimezone))} />
            </label>
          </div>

          <div className="hgn-card grid gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-hgnNavy">One-click SEO</h2>
                <p className="mt-1 text-sm text-slate-600">Creates Google News, search and social fields from the finished story. It never rewrites the article.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-black ${readiness.score >= 90 ? "bg-emerald-100 text-emerald-800" : readiness.score >= 70 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{readiness.score}%</span>
            </div>
            <button type="button" onClick={generateAllSeo} className="hgn-btn-primary">Generate all SEO</button>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {readiness.checks.map((check) => <div key={check.key} className={`rounded-xl border p-2 font-bold ${check.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{check.ok ? "✓" : "•"} {check.label}</div>)}
            </div>
            <label>
              SEO title
              <input value={article.seo_title || ""} onChange={(e) => update("seo_title", e.target.value)} maxLength={90} />
            </label>
            <label>
              Search description
              <textarea value={article.meta_description || ""} onChange={(e) => update("meta_description", e.target.value)} rows={3} maxLength={220} />
            </label>
            <label>
              Google News headline
              <input value={article.google_news_headline || ""} onChange={(e) => update("google_news_headline", e.target.value)} maxLength={110} />
            </label>
            <label>
              Social title
              <input value={article.social_title || ""} onChange={(e) => update("social_title", e.target.value)} maxLength={110} />
            </label>
            <label>
              Social description
              <textarea value={article.social_description || ""} onChange={(e) => update("social_description", e.target.value)} rows={3} maxLength={240} />
            </label>
            <label>
              Suggested keywords
              <input value={Array.isArray(article.seo_keywords) ? article.seo_keywords.join(", ") : article.seo_keywords || ""} onChange={(e) => update("seo_keywords", e.target.value)} />
            </label>
            <label className="flex items-center gap-2">
              <input className="w-auto" type="checkbox" checked={article.google_news_include !== false} onChange={(e) => update("google_news_include", e.target.checked)} />
              Include in Google News sitemap
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
            <label>
              Alt text
              <textarea value={article.image_alt || ""} onChange={(e) => update("image_alt", e.target.value)} rows={2} placeholder="Describe what is important in the photo for screen readers." />
            </label>
            <label>
              Caption
              <textarea value={article.image_caption || ""} onChange={(e) => update("image_caption", e.target.value)} rows={2} placeholder="What is happening in the photo?" />
            </label>
            <label>
              Photo credit
              <input value={article.image_credit || ""} onChange={(e) => update("image_credit", e.target.value)} placeholder="Photographer or source" />
            </label>
            {uploading && <p className="font-bold text-hgnBlue">Uploading photo...</p>}
          </div>

          <div className="hgn-card grid gap-3 p-5">
            <h2 className="text-2xl font-black text-hgnNavy">Front page</h2>
            <label className="flex items-center gap-2">
              <input className="w-auto" type="checkbox" checked={!!article.front_page_main} onChange={(e) => update("front_page_main", e.target.checked)} />
              Main front-page story
            </label>
            <p className="rounded-xl border bg-slate-50 p-3 text-sm leading-6 text-slate-600">Front-page photographs are now managed separately in <a href="/admin/front-page" className="font-bold text-hgnBlue underline">Front Page Manager</a>. This keeps standalone photographs out of the article archive.</p>
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
            <button onClick={() => save()} disabled={saving} className="hgn-btn-primary">{saving && saveAction === "save" ? "Saving…" : "Save changes"}</button>
            <button onClick={() => save("published")} disabled={saving} className="hgn-btn-primary">{saving && saveAction === "publish" ? "Publishing…" : "Publish now"}</button>
            <button onClick={deleteArticle} className="hgn-btn-dark">Delete article</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
