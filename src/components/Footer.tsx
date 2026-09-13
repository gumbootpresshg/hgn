"use client"

import Link from "next/link"
import { useSiteTheme } from "@/components/theme/SiteThemeProvider"
import { defaultFooter, type SitePlatformConfig } from "@/lib/site-platform-config"

function SmartLink({ href, label, className="" }: { href:string; label:string; className?:string }) {
  if (/^https?:\/\//i.test(href)) return <a href={href} target="_blank" rel="noreferrer" className={className}>{label}</a>
  return <Link href={href} className={className}>{label}</Link>
}

export function Footer({ initialPlatformConfig }: { initialPlatformConfig?: SitePlatformConfig }) {
  const { labels } = useSiteTheme()
  const footer = initialPlatformConfig?.footer || defaultFooter
  return (
    <footer className="mt-8 border-t-4 md:mt-16 border-double border-stone-900 bg-[#f4f0e8] text-stone-900">
      <div className="mx-auto max-w-[1480px] px-4 py-10 md:px-7">
        <div className="grid gap-10 border-b border-stone-400 pb-9 lg:grid-cols-[1.25fr_2fr_1fr]">
          <div>
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight">{labels.siteName}</Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">Independent reporting, community information and the stories of Haida Gwaii.</p>
            <div className="mt-5 flex gap-4 text-sm font-bold"><a href="https://www.facebook.com/haidagwaiinews" target="_blank" rel="noreferrer">Facebook</a></div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footer.groups.filter(g=>g.enabled).map(group => <div key={group.id}><h2 className="newspaper-kicker text-stone-900">{group.title}</h2><div className="mt-3 grid gap-2 text-sm text-stone-600">{group.links.filter(l=>l.enabled).map(link=><SmartLink key={link.id} href={link.href} label={link.label} className="hover:text-hgnRed"/>)}</div></div>)}
          </div>
          <div><h2 className="newspaper-kicker text-stone-900">Support local journalism</h2><p className="mt-3 text-sm leading-6 text-stone-600">Help keep local reporting and community information accessible.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/support-us" className="newspaper-button">{labels.support}</Link><Link href="/subscribe" className="newspaper-button-outline">{labels.subscribe}</Link></div></div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-xs text-stone-500 md:flex-row md:items-center md:justify-between"><p>© {new Date().getFullYear()} {labels.siteName}. All rights reserved.</p><div className="flex flex-wrap gap-4">{footer.utilityLinks.filter(l=>l.enabled).map(link=><SmartLink key={link.id} href={link.href} label={link.label}/>)}</div></div>
      </div>
    </footer>
  )
}
