import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingAlertBar } from "@/components/BreakingAlertBar";
import TsunamiAlertBanner from "@/components/TsunamiAlertBanner";
import EarthquakeAlertBanner from "@/components/EarthquakeAlertBanner";
import { absoluteUrl, SITE } from "@/lib/site";

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
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organization = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: SITE.name, url: SITE.url, logo: absoluteUrl("/hgn-logo.png"), sameAs: [], publishingPrinciples: absoluteUrl("/community-standards") };
  return <html lang="en-CA"><body><a href="#main-content" className="skip-link">Skip to main content</a><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /><BreakingAlertBar /><Header /><TsunamiAlertBanner /><EarthquakeAlertBanner /><div id="main-content">{children}</div><Footer /></body></html>;
}
