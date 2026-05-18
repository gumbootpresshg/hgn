export const SITE = {
  name: "Haida Gwaii News",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com",
  description: "Local news, community information, events and stories from Haida Gwaii.",
  defaultImage: "/news-placeholder.jpg",
};

export function absoluteUrl(path = "") {
  if (path.startsWith("http")) return path;
  const base = SITE.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
