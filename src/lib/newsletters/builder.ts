import { articleTopic } from "@/lib/newsletters/server";

type DbClient = any;

type BuildOptions = {
  db: DbClient;
  settings: any;
  lookbackDays?: number;
  articleIds?: string[];
  now?: Date;
};

function allowedBySettings(article: any, settings: any) {
  const topic = articleTopic(article);
  if (topic === "opinion" && !settings.include_opinion) return { allowed: false, reason: "Opinion disabled" };
  if (topic === "obituaries" && !settings.include_obituaries) return { allowed: false, reason: "Obituaries disabled" };
  if (topic === "marketplace" && !settings.include_marketplace) return { allowed: false, reason: "Marketplace disabled" };
  if (topic === "guide" && !settings.include_guide) return { allowed: false, reason: "Guide updates disabled" };
  if (topic === "weather_ferry" && !(settings.include_weather || settings.include_ferry)) return { allowed: false, reason: "Weather and ferry disabled" };
  return { allowed: true, reason: "Included" };
}

export async function buildNewsletterContent(options: BuildOptions) {
  const { db, settings } = options;
  const now = options.now || new Date();
  const lookbackDays = Math.max(1, Number(options.lookbackDays || settings.lookback_days || 14));
  const from = new Date(now.getTime() - lookbackDays * 86400000);
  const maxStories = Math.max(1, Number(settings.max_stories || 12));
  const fields = "id,title,slug,excerpt,dek,category,subcategory,image_url,published_at,created_at,updated_at,featured,front_page_main,status";

  let candidates: any[] = [];
  let source = "recent_published";
  let queryError = "";

  if (options.articleIds?.length) {
    const result = await db.from("articles").select(fields).in("id", options.articleIds).eq("status", "published");
    candidates = result.data || [];
    queryError = result.error?.message || "";
    const order = new Map(options.articleIds.map((id, index) => [id, index]));
    candidates.sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    source = "manual_selection";
  } else {
    const recent = await db
      .from("articles")
      .select(fields)
      .eq("status", "published")
      .gte("published_at", from.toISOString())
      .lte("published_at", now.toISOString())
      .order("front_page_main", { ascending: false })
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(Math.max(maxStories * 4, 40));
    candidates = recent.data || [];
    queryError = recent.error?.message || "";

    if (!queryError && candidates.length === 0) {
      const fallback = await db
        .from("articles")
        .select(fields)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(Math.max(maxStories * 4, 40));
      candidates = fallback.data || [];
      queryError = fallback.error?.message || "";
      source = "published_fallback";
    }
  }

  if (queryError) throw new Error(queryError);

  const diagnostics = candidates.map((article) => {
    const rule = allowedBySettings(article, settings);
    return {
      id: article.id,
      title: article.title,
      status: article.status,
      published_at: article.published_at,
      category: article.category,
      topic: articleTopic(article),
      included: rule.allowed,
      reason: rule.reason,
    };
  });

  let articles = candidates
    .filter((article) => allowedBySettings(article, settings).allowed)
    .slice(0, maxStories)
    .map((article) => ({
      ...article,
      topic: articleTopic(article),
      excerpt: article.excerpt || article.dek || "Read the full story on Haida Gwaii News.",
    }));

  // A newsletter with no stories is not useful. Fall back to the newest published news items.
  if (!articles.length && candidates.length) {
    articles = candidates.slice(0, maxStories).map((article) => ({
      ...article,
      topic: articleTopic(article),
      excerpt: article.excerpt || article.dek || "Read the full story on Haida Gwaii News.",
    }));
    source += "_all_topics_fallback";
  }

  let events: any[] = [];
  if (settings.include_events) {
    const result = await db
      .from("events")
      .select("id,title,description,start_date,start_time,end_time,is_all_day,location,community")
      .gte("start_date", now.toISOString().slice(0, 10))
      .order("start_date", { ascending: true })
      .limit(8);
    const seen = new Set<string>();
    events = (result.data || []).filter((event: any) => {
      const key = `${String(event.title || "").trim().toLowerCase()}|${event.start_date || ""}`;
      if (!event.title || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return {
    content: { articles, events },
    diagnostics: {
      source,
      lookback_days: lookbackDays,
      from: from.toISOString(),
      to: now.toISOString(),
      candidates_found: candidates.length,
      stories_included: articles.length,
      events_included: events.length,
      articles: diagnostics,
    },
    from,
    to: now,
  };
}
