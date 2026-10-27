import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata("Horoscope", "Weekly horoscope readings for Haida Gwaii News readers.", "/horoscope")

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) { return children }
