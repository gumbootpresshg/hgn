import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingAlertBar } from "@/components/BreakingAlertBar";
import TsunamiAlertBanner from "@/components/TsunamiAlertBanner";
import EarthquakeAlertBanner from "@/components/EarthquakeAlertBanner";

export const metadata: Metadata = { title: "Haida Gwaii News", description: "News from the edge" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><BreakingAlertBar /><Header />
          <TsunamiAlertBanner />
          <EarthquakeAlertBanner />{children}<Footer /></body></html>;
}