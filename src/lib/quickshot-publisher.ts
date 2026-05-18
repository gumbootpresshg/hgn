import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function quickshotToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForQuickshot(post: Row) {
  const status = String(post.status || "").toLowerCase();
  const priority = String(post.priority || "").toLowerCase();
  if (status === "blocked" || priority === "urgent") return "bad";
  if (status === "needs_photo" || post.photo_needed) return "warn";
  if (status === "published" || post.published_at) return "good";
  if (status === "ready" || post.homepage_ready) return "blue";
  return "neutral";
}

export async function getQuickshotSnapshot() {
  const [posts, templates, todayItems, homepageSlots] = await Promise.all([
    safeSelect("quickshot_posts", "sort_order", true, 100),
    safeSelect("quickshot_templates", "sort_order", true, 20),
    safeSelect("today_board_items", "sort_order", true, 30),
    safeSelect("homepage_focus_slots", "sort_order", true, 20),
  ]);

  const drafts = posts.filter((post) => String(post.status || "").toLowerCase() === "draft");
  const ready = posts.filter((post) => ["ready", "published"].includes(String(post.status || "").toLowerCase()) || post.homepage_ready);
  const blockers = posts.filter((post) => String(post.status || "").toLowerCase() === "blocked" || post.photo_needed);
  const published = posts.filter((post) => String(post.status || "").toLowerCase() === "published" || post.published_at);

  let score = 74;
  if (templates.length >= 3) score += 8;
  if (ready.length > 0) score += 8;
  if (published.length > 0) score += 5;
  if (blockers.length > 0) score -= 18;
  if (drafts.length > 8) score -= 8;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    posts,
    templates,
    drafts,
    ready,
    blockers,
    published,
    todayItems,
    homepageSlots,
  };
}
