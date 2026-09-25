"use client";

import { track } from "@vercel/analytics";

export type HgnAnalyticsEvent = "article_view" | "ad_impression" | "ad_click" | "newsletter_signup" | "support_click" | "marketplace_lead" | "event_interest" | "search_submit";

type EventDetails = {
  pagePath?: string;
  articleId?: string | null;
  articleSlug?: string | null;
  placement?: string | null;
  adId?: string | null;
  source?: string | null;
};

export function recordHgnAnalyticsEvent(eventType: HgnAnalyticsEvent, details: EventDetails = {}) {
  if (typeof window === "undefined") return;
  const payload = {
    eventType,
    pagePath: details.pagePath || window.location.pathname,
    articleId: details.articleId || undefined,
    articleSlug: details.articleSlug || undefined,
    placement: details.placement || undefined,
    adId: details.adId || undefined,
    source: details.source || undefined,
  };

  try {
    track(eventType, {
      placement: payload.placement || null,
      source: payload.source || null,
    });
  } catch {
    // The internal event store remains useful even when Vercel tracking is unavailable locally.
  }

  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/record", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // Fall through to fetch.
  }
  void fetch("/api/analytics/record", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
}
