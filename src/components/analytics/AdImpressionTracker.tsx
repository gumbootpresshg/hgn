"use client";

import { useEffect, useRef } from "react";
import { recordHgnAnalyticsEvent } from "@/components/analytics/analytics-events";

export default function AdImpressionTracker({ adId, placement, children }: { adId?: string | null; placement: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adId || !ref.current) return;
    const key = `hgn-ad-impression:${adId}:${window.location.pathname}`;
    if (window.sessionStorage.getItem(key)) return;
    let timeout: number | null = null;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
      timeout = window.setTimeout(() => {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
        recordHgnAnalyticsEvent("ad_impression", { adId, placement, source: "display" });
        observer.disconnect();
      }, 750);
    }, { threshold: [0.5] });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [adId, placement]);

  return <div ref={ref}>{children}</div>;
}
