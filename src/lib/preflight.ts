import { supabase } from "@/lib/supabase";

export type Row = Record<string, any>;

export function preflightTone(status?: string | null) {
  const s = String(status || "todo").toLowerCase();
  if (s === "pass" || s === "resolved" || s === "published") return "good";
  if (s === "watch" || s === "waived" || s === "planned" || s === "in_progress") return "warn";
  if (s === "fail" || s === "open" || s === "blocked") return "bad";
  return "neutral";
}

export function toneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

async function rows(table: string, order = "created_at", limit = 25, ascending = false) {
  try {
    const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
    if (error) return [] as Row[];
    return (data || []) as Row[];
  } catch {
    return [] as Row[];
  }
}

async function articlesForPreflight() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,slug,status,category,author,published_at,created_at,seo_title,seo_description,image_url,alt_text,image_credit,google_news_include")
      .in("status", ["draft", "review", "scheduled", "published"])
      .order("created_at", { ascending: false })
      .limit(18);
    if (error) return [] as Row[];
    return (data || []) as Row[];
  } catch {
    return [] as Row[];
  }
}

async function checksFor(articleIds: string[]) {
  if (!articleIds.length) return [] as Row[];
  try {
    const { data, error } = await supabase.from("article_preflight_checks").select("*").in("article_id", articleIds);
    if (error) return [] as Row[];
    return (data || []) as Row[];
  } catch {
    return [] as Row[];
  }
}

async function notesFor(articleIds: string[]) {
  if (!articleIds.length) return [] as Row[];
  try {
    const { data, error } = await supabase.from("article_publish_notes").select("*").in("article_id", articleIds).order("created_at", { ascending: false });
    if (error) return [] as Row[];
    return (data || []) as Row[];
  } catch {
    return [] as Row[];
  }
}

export function articleAutoChecks(article: Row) {
  return [
    { label: "Slug", pass: Boolean(article.slug), helper: article.slug || "Missing slug" },
    { label: "Featured image", pass: Boolean(article.image_url), helper: article.image_url ? "Image set" : "Missing image" },
    { label: "Image credit", pass: Boolean(article.image_credit), helper: article.image_credit || "Missing credit" },
    { label: "Alt text", pass: Boolean(article.alt_text), helper: article.alt_text || "Missing alt text" },
    { label: "SEO title", pass: Boolean(article.seo_title), helper: article.seo_title || "Missing SEO title" },
    { label: "SEO description", pass: Boolean(article.seo_description), helper: article.seo_description || "Missing SEO description" },
  ];
}

export function articleScore(article: Row, checks: Row[], notes: Row[]) {
  const auto = articleAutoChecks(article);
  const autoPass = auto.filter((item) => item.pass).length;
  const manualPass = checks.filter((check) => ["pass", "waived"].includes(String(check.status || "").toLowerCase())).length;
  const manualFail = checks.filter((check) => ["fail"].includes(String(check.status || "").toLowerCase())).length;
  const openNotes = notes.filter((note) => String(note.status || "open").toLowerCase() === "open").length;
  const total = auto.length + Math.max(checks.length, 1);
  const score = Math.round(((autoPass + manualPass) / total) * 100) - manualFail * 15 - openNotes * 8;
  return Math.max(0, Math.min(100, score));
}

export async function getPreflightSnapshot() {
  const [articles, templates, runs] = await Promise.all([
    articlesForPreflight(),
    rows("editorial_preflight_templates", "sort_order", 40, true),
    rows("beta_publishing_runs", "run_date", 8),
  ]);
  const articleIds = articles.map((article) => String(article.id));
  const [checks, notes] = await Promise.all([checksFor(articleIds), notesFor(articleIds)]);
  const articleCards = articles.map((article) => {
    const articleChecks = checks.filter((check) => String(check.article_id) === String(article.id));
    const articleNotes = notes.filter((note) => String(note.article_id) === String(article.id));
    return {
      article,
      checks: articleChecks,
      notes: articleNotes,
      auto: articleAutoChecks(article),
      score: articleScore(article, articleChecks, articleNotes),
    };
  });
  const blocked = articleCards.filter((card) => card.score < 70 || card.notes.some((note) => String(note.status || "open") === "open")).length;
  const ready = articleCards.filter((card) => card.score >= 85).length;
  const avg = articleCards.length ? Math.round(articleCards.reduce((sum, card) => sum + card.score, 0) / articleCards.length) : 0;
  return { articles: articleCards, templates, runs, blocked, ready, averageScore: avg };
}
