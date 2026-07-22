"use client"

import Link from "next/link"
import { useSiteTheme } from "@/components/theme/SiteThemeProvider"

const footerGroups = [
  { title: "News", links: [["Latest Stories", "/articles"], ["Opinion", "/opinion"], ["Letters", "/letters"], ["Obituaries", "/obituaries"]] },
  { title: "Community", links: [["Events", "/events"], ["Marketplace", "/marketplace"], ["Notices", "/notices"], ["Live Map", "/live-map"]] },
  { title: "About", links: [["About HGN", "/about"], ["Contact", "/contact"], ["Advertise", "/advertise"], ["Community Standards", "/community-standards"]] },
]

export function Footer() {
  const { labels } = useSiteTheme()
  return (
    <footer className="mt-16 border-t-4 border-double border-stone-900 bg-[#f4f0e8] text-stone-900">
      <div className="mx-auto max-w-[1480px] px-4 py-10 md:px-7">
        <div className="grid gap-10 border-b border-stone-400 pb-9 lg:grid-cols-[1.25fr_2fr_1fr]">
          <div>
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight">{labels.siteName}</Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">Independent reporting, community information and the stories of Haida Gwaii.</p>
            <div className="mt-5 flex gap-4 text-sm font-bold">
              <a href="https://www.facebook.com/haidagwaiinews" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="newspaper-kicker text-stone-900">{group.title}</h2>
                <div className="mt-3 grid gap-2 text-sm text-stone-600">
                  {group.links.map(([label, href]) => <Link key={href} href={href} className="hover:text-hgnRed">{label}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="newspaper-kicker text-stone-900">Support local journalism</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Help keep local reporting and community information accessible.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/support-us" className="newspaper-button">{labels.support}</Link>
              <Link href="/subscribe" className="newspaper-button-outline">{labels.subscribe}</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-xs text-stone-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {labels.siteName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/corrections">Corrections</Link><Link href="/accessibility-status">Accessibility</Link></div>
        </div>
      </div>
    </footer>
  )
}
