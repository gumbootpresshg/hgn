"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ImageUploadBox from "@/components/ImageUploadBox";
import { supabase } from "@/lib/supabase";

type Article = {
  id: string;
  title: string;
  slug: string;
  status?: string | null;
  published_at?: string | null;
};

type Settings = {
  id: "current";
  lead_article_id: string | null;
  photo_url: string | null;
  photo_thumbnail_url: string | null;
  photo_caption: string | null;
  photo_credit: string | null;
  photo_alt: string | null;
  related_article_id: string | null;
  display_starts_at: string | null;
  display_expires_at: string | null;
  is_active: boolean;
};

const emptySettings: Settings = {
  id: "current",
  lead_article_id: null,
  photo_url: null,
  photo_thumbnail_url: null,
  photo_caption: null,
  photo_credit: null,
  photo_alt: null,
  related_article_id: null,
  display_starts_at: null,
  display_expires_at: null,
  is_active: true,
};

function localValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function FrontPageManagerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [altManuallyEdited, setAltManuallyEdited] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setMessage("");
    const [{ data: articleRows, error: articleError }, { data: row, error: settingsError }] = await Promise.all([
      supabase.from("articles").select("id,title,slug,status,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(250),
      supabase.from("front_page_settings").select("*").eq("id", "current").maybeSingle(),
    ]);
    if (articleError || settingsError) {
      setMessage(articleError?.message || settingsError?.message || "Unable to load front-page settings.");
    }
    setArticles((articleRows || []) as Article[]);
    if (row) {
      const loaded = { ...emptySettings, ...(row as Settings) };
      setSettings(loaded);
      setAltManuallyEdited(Boolean(loaded.photo_alt && loaded.photo_alt !== loaded.photo_caption));
    }
    setLoading(false);
  }

  const lead = useMemo(() => articles.find((article) => article.id === settings.lead_article_id), [articles, settings.lead_article_id]);
  const related = useMemo(() => articles.find((article) => article.id === settings.related_article_id), [articles, settings.related_article_id]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const payload = {
      ...settings,
      display_starts_at: settings.display_starts_at ? new Date(settings.display_starts_at).toISOString() : null,
      display_expires_at: settings.display_expires_at ? new Date(settings.display_expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
      updated_by: sessionData.session?.user.id || null,
    };
    const { error } = await supabase.from("front_page_settings").upsert(payload, { onConflict: "id" });
    setMessage(error ? error.message : "Front page saved.");
    setSaving(false);
  }

  function clearPhoto() {
    setSettings((current) => ({
      ...current,
      photo_url: null,
      photo_thumbnail_url: null,
      photo_caption: null,
      photo_credit: null,
      photo_alt: null,
      related_article_id: null,
      display_starts_at: null,
      display_expires_at: null,
    }));
  }

  if (loading) return <main className="mx-auto max-w-6xl px-5 py-10"><p>Loading front-page manager...</p></main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
      <header className="border-b border-stone-300 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Publisher tools</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl font-bold text-stone-950">Front Page Manager</h1>
            <p className="mt-3 max-w-3xl text-stone-600">Control the lead story and the main photograph separately. A front-page photo does not require its own article.</p>
          </div>
          <Link href="/" target="_blank" className="hgn-btn-dark">Preview homepage</Link>
        </div>
      </header>

      {message ? <p className="rounded-xl border bg-white p-4 font-bold text-stone-700">{message}</p> : null}

      <section className="grid gap-7 lg:grid-cols-2">
        <article className="hgn-card p-6">
          <p className="newspaper-kicker">Lead story</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Choose the main headline</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Select any published article. The story does not need a photograph.</p>
          <label className="mt-5 block font-bold">
            Published article
            <select className="mt-2 w-full" value={settings.lead_article_id || ""} onChange={(event) => update("lead_article_id", event.target.value || null)}>
              <option value="">Use latest published story automatically</option>
              {articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
            </select>
          </label>
          <div className="mt-5 border-t border-stone-200 pt-4">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500">Current selection</p>
            <p className="mt-2 font-serif text-2xl font-bold">{lead?.title || "Automatic latest story"}</p>
            {lead ? <Link href={`/articles/${lead.slug}`} target="_blank" className="mt-3 inline-block text-sm font-bold text-hgnBlue">Open article →</Link> : null}
          </div>
        </article>

        <article className="hgn-card p-6">
          <p className="newspaper-kicker">Display controls</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Publication window</h2>
          <label className="mt-5 flex items-center gap-3 font-bold">
            <input className="w-auto" type="checkbox" checked={settings.is_active} onChange={(event) => update("is_active", event.target.checked)} />
            Show the selected front-page photo
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="font-bold">Start showing<input className="mt-2" type="datetime-local" value={localValue(settings.display_starts_at)} onChange={(event) => update("display_starts_at", event.target.value || null)} /></label>
            <label className="font-bold">Stop showing<input className="mt-2" type="datetime-local" value={localValue(settings.display_expires_at)} onChange={(event) => update("display_expires_at", event.target.value || null)} /></label>
          </div>
          <p className="mt-3 text-xs leading-5 text-stone-500">Leave both dates blank to keep the photo live until you replace or remove it.</p>
        </article>
      </section>

      <section className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]">
        <ImageUploadBox
          bucket="article-images"
          usageType="front-page"
          onUploaded={(asset) => setSettings((current) => ({
            ...current,
            photo_url: asset.web_url || asset.public_url,
            photo_thumbnail_url: asset.thumbnail_url || null,
            photo_caption: asset.caption || current.photo_caption,
            photo_credit: asset.credit || current.photo_credit,
            photo_alt: asset.alt_text || current.photo_alt,
          }))}
        />

        <article className="hgn-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="newspaper-kicker">Front-page photograph</p><h2 className="mt-2 font-serif text-3xl font-bold">Photo details</h2></div>
            {settings.photo_url ? <button type="button" onClick={clearPhoto} className="hgn-btn-dark">Remove photo</button> : null}
          </div>
          {settings.photo_url ? <div className="mt-5 overflow-hidden border border-stone-300 bg-stone-100"><img src={settings.photo_url} alt={settings.photo_alt || "Front-page preview"} className="aspect-video w-full object-cover" /></div> : <div className="mt-5 grid aspect-video place-items-center border border-dashed border-stone-300 bg-stone-50 text-stone-500">Upload a photograph to preview it here.</div>}
          <div className="mt-5 grid gap-4">
            <label className="font-bold">Caption<textarea rows={3} value={settings.photo_caption || ""} onChange={(event) => { const caption = event.target.value || null; setSettings((current) => ({ ...current, photo_caption: caption, photo_alt: altManuallyEdited ? current.photo_alt : caption })); }} placeholder="What is happening in the photograph?" /></label>
            <label className="font-bold">Photo credit<input value={settings.photo_credit || ""} onChange={(event) => update("photo_credit", event.target.value || null)} placeholder="Photographer or source" /></label>
            <label className="font-bold">Alt text<textarea rows={3} value={settings.photo_alt || ""} onChange={(event) => { setAltManuallyEdited(true); update("photo_alt", event.target.value || null); }} placeholder="Starts from the caption. Edit it when the visual description should be different." /><span className="mt-1 block text-xs font-normal text-stone-500">This fills from the caption until you edit it yourself.</span></label>
            <label className="font-bold">Optional related article<select className="mt-2 w-full" value={settings.related_article_id || ""} onChange={(event) => update("related_article_id", event.target.value || null)}><option value="">No article link</option>{articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}</select></label>
            {related ? <p className="text-sm text-stone-600">The photograph will link to <strong>{related.title}</strong>.</p> : <p className="text-sm text-stone-600">With no related article, the photograph appears as an editorial image without creating a fake story.</p>}
          </div>
        </article>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="hgn-btn-primary shadow-xl">{saving ? "Saving..." : "Save front page"}</button>
      </div>
    </main>
  );
}
