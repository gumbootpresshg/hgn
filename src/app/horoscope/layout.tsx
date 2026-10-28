import { nonNewsPageMetadata } from "@/lib/page-metadata"

export const metadata = nonNewsPageMetadata("Horoscope", "Weekly horoscope readings for Haida Gwaii News readers.", "/horoscope")

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) { return children }
