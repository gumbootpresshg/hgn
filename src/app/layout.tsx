import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingAlertBar } from "@/components/BreakingAlertBar";
import TsunamiAlertBanner from "@/components/TsunamiAlertBanner";
import EarthquakeAlertBanner from "@/components/EarthquakeAlertBanner";
import { absoluteUrl, SITE } from "@/lib/site";
import { SiteThemeProvider } from "@/components/theme/SiteThemeProvider";
import { getPublicSiteConfig } from "@/lib/server/public-site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  category: "news",
  alternates: { canonical: "/", types: { "application/rss+xml": absoluteUrl("/rss.xml") } },
  openGraph: { type: "website", locale: "en_CA", siteName: SITE.name, title: SITE.name, description: SITE.description, url: SITE.url, images: [{ url: absoluteUrl(SITE.defaultImage), width: 1200, height: 630, alt: SITE.name }] },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description, images: [absoluteUrl(SITE.defaultImage)] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }], apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff", colorScheme: "light" };
export const revalidate = 10;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = await getPublicSiteConfig();
  const organization = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", "@id": `${SITE.url.replace(/\/$/, "")}#organization`, name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: absoluteUrl("/hgn-logo.png") }, publishingPrinciples: absoluteUrl("/community-standards"), ethicsPolicy: absoluteUrl("/community-standards"), correctionsPolicy: absoluteUrl("/request-correction") };
  const website = { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE.url.replace(/\/$/, "")}#website`, name: SITE.name, url: SITE.url, publisher: { "@id": `${SITE.url.replace(/\/$/, "")}#organization` }, potentialAction: { "@type": "SearchAction", target: `${SITE.url.replace(/\/$/, "")}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  return <html lang="en-CA"><body><SiteThemeProvider initialTheme={siteConfig.theme}><a href="#main-content" className="skip-link">Skip to main content</a><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} /><BreakingAlertBar /><Header initialPlatformConfig={siteConfig.platform} /><TsunamiAlertBanner /><EarthquakeAlertBanner /><div id="main-content">{children}</div><Footer initialPlatformConfig={siteConfig.platform} /></SiteThemeProvider></body></html>;
}
