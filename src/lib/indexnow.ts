import { absoluteUrl, SITE } from "@/lib/site";

// IndexNow keys are public: search engines fetch this same value from /<key>.txt.
// Hex, 32 characters, within the 8–128 character rule.
export const INDEXNOW_KEY = "4ef51c0e6784b9942074dadbfe78d3c3";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

export function indexNowKeyLocation() {
  return absoluteUrl(INDEXNOW_KEY_PATH);
}

export function normalizeIndexNowUrl(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text.startsWith("http") ? text : absoluteUrl(text));
    const site = new URL(SITE.url);
    if (url.host !== site.host) return "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function urlIsPubliclyLive(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function submitIndexNow(requested: unknown[]) {
  const urls = Array.from(new Set(requested.map(normalizeIndexNowUrl).filter(Boolean))).slice(0, 100);
  const live: string[] = [];
  const skipped: string[] = [];
  for (const url of urls) {
    if (await urlIsPubliclyLive(url)) live.push(url);
    else skipped.push(url);
  }

  if (!live.length) {
    return { submitted: false, count: 0, skipped, status: null as number | null, error: skipped.length ? "The article URL is not publicly available yet." : "No valid HGN URLs were supplied." };
  }

  const host = new URL(SITE.url).host;
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(),
      urlList: live,
    }),
  });
  const text = await response.text().catch(() => "");
  const accepted = response.ok || response.status === 202;
  return {
    submitted: accepted,
    count: live.length,
    skipped,
    status: response.status,
    error: accepted ? "" : text || "IndexNow submission failed.",
  };
}
