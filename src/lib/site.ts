export const SITE = {
  name: "Haida Gwaii News",
  // This is the public, permanent domain. Preview deployments must never become share URLs.
  url: "https://haidagwaiinews.com",
  description: "Local news, community information, events and stories from Haida Gwaii.",
  defaultImage: "/hgn-social-share.png",
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
