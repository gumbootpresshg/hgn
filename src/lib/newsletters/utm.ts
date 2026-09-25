export function utmUrl(value: string, edition: any) {
  try {
    const url = new URL(value);
    if (url.pathname.includes("/newsletter/preferences/") || url.pathname.includes("unsubscribe")) return value;
    url.searchParams.set("utm_source", "hgn_newsletter");
    url.searchParams.set("utm_medium", "email");
    url.searchParams.set("utm_campaign", String(edition.product_slug || "hgn-news") + "-" + String(edition.slug || edition.id || "edition"));
    return url.toString();
  } catch { return value; }
}
