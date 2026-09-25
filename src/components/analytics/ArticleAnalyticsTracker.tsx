"use client";

import { useEffect } from "react";
import { recordHgnAnalyticsEvent } from "@/components/analytics/analytics-events";

export default function ArticleAnalyticsTracker({ articleId, slug }: { articleId?: string | null; slug?: string | null }) {
  useEffect(() => {
    recordHgnAnalyticsEvent("article_view", { articleId, articleSlug: slug, source: "article" });
  }, [articleId, slug]);
  return null;
}
