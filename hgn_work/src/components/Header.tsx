"use client"

import Link from "next/link"
import { Menu, Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { slugify } from "@/lib/article-routing"

const utilityLinks = [
  { href: "/account", label: "My HGN" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/advertise", label: "Advertise" },
]

const fallbackColumns = [
  "Tlellagram", "Living Out Loud", "Life on the Gwaii", "GKNS Chronicles", "Off Island Antics",
  "Wisdom Beyond", "Island Cuisine", "Science Matters", "Backseat Life-ing", "Book Talk",
  "Gallivanting", "Terry's Take", "Sandspit Shingle", "Masset Matters",
]

type NavLink = { href: string; label: string; children?: NavLink[] }
type NavItem = { label: string; children: NavLink[] }

function DesktopDropdown({ item }: { item: NavItem }) {
  const wide = item.children.some((child) => child.children?.length)
  return (
    <div className="group relative shrink-0">
      <button
        className="flex min-h-11 items-center gap-1 rounded-lg px-2 font-bold hover:bg-slate-100 hover:text-hgnBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue"
        type="button"
        aria-haspopup="true"
      >
        {item.label}<span aria-hidden="true">▾</span>
      </button>
      <div className={[
        "invisible absolute left-1/2 top-full z-[10000] -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100",
        wide ? "w-[min(760px,92vw)]" : "w-72",
      ].join(" ")}>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-left tracking-normal text-slate-800 shadow-xl">
          <div className={wide ? "grid gap-2 md:grid-cols-2" : "space-y-1"}>
            {item.children.map((child) => (
              <div key={child.href} className={child.children ? "md:col-span-2" : ""}>
                <Link href={child.href} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-slate-100 hover:text-hgnBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue">
                  {child.label}
                </Link>
                {child.children ? (
                  <div className="grid gap-1 border-t border-slate-100 px-2 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {child.children.map((sub) => (
                      <Link key={sub.href} href={sub.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-hgnBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [isStuck, setIsStuck] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [today, setToday] = useState("")
  const columns = useMemo(() => fallbackColumns.map((name) => ({ href: `/columns/${slugify(name)}`, label: name })), [])

  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date()))
    const onScroll = () => setIsStuck((document.getElementById("hgn-masthead")?.getBoundingClientRect().bottom ?? 0) <= 0)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const navItems: NavItem[] = useMemo(() => [
    { label: "News", children: [{ href: "/news", label: "Local News" }, { href: "/sports", label: "Sports" }, { href: "/mountie-minute", label: "Mountie Minute" }] },
    { label: "Opinion", children: [{ href: "/opinion/editorials", label: "Editorials" }, { href: "/opinion/on-the-record", label: "On the Record" }, { href: "/columns", label: "Columns", children: columns }, { href: "/letters", label: "Letters to the Editor" }, { href: "/submit-guest-opinion", label: "Submit a Guest Opinion" }, { href: "/submit-letter", label: "Submit a Letter" }] },
    { label: "Marketplace", children: [{ href: "/marketplace", label: "All Listings" }, { href: "/marketplace/post", label: "Post Ad" }, { href: "/marketplace/my-listings", label: "My Listings" }, { href: "/marketplace?category=vehicles-boats", label: "Vehicles & Boats" }, { href: "/marketplace?category=real-estate", label: "Real Estate" }, { href: "/marketplace?category=rentals", label: "Rentals" }, { href: "/marketplace?category=jobs", label: "Jobs" }, { href: "/marketplace?category=services", label: "Services" }] },
    { label: "Weather", children: [{ href: "/weather", label: "Weather Desk" }, { href: "/weather/tides", label: "Tide Desk" }, { href: "/weather/earthquakes", label: "Earthquakes" }, { href: "/weather/tsunami-alerts", label: "Tsunami Alerts" }] },
    { label: "Explore", children: [{ href: "/live-map", label: "Live Map" }, { href: "/ferry-info", label: "Ferry Info" }, { href: "/explore/live", label: "Live Utilities" }, { href: "/explore/live/power-outages", label: "Power Outages" }] },
  ], [columns])

  const directLinks = [{ href: "/events", label: "Events" }, { href: "/obituaries", label: "Obituaries" }, { href: "/horoscope", label: "Horoscope" }]
  const close = () => setMobileOpen(false)

  return (
    <>
      <header id="hgn-masthead" className="relative z-40 border-b border-slate-300 bg-white">
        <div className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-2 text-xs text-slate-600 md:grid-cols-3 md:items-center">
            <div className="font-semibold">{today}</div>
            <div className="hidden text-center font-semibold tracking-[0.12em] sm:block">Independent free local journalism</div>
            <nav aria-label="Utility" className="flex flex-wrap gap-3 md:justify-end">
              {utilityLinks.map((link) => <Link key={link.href} href={link.href} className="font-semibold hover:text-hgnBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue">{link.label}</Link>)}
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-4 text-center md:py-5">
          <Link href="/" className="font-serif text-[2rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl md:text-7xl">Haida Gwaii News</Link>
        </div>
      </header>

      <div className={isStuck ? "h-[57px]" : ""} aria-hidden="true" />
      <nav aria-label="Primary" className={["z-[9999] border-b border-t border-slate-300 bg-white/95 shadow-sm backdrop-blur", isStuck ? "fixed inset-x-0 top-0" : "relative"].join(" ")}>
        <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4">
          <Link href="/" className={["shrink-0 font-serif text-lg font-black tracking-tight text-slate-950", isStuck ? "block" : "md:hidden"].join(" ")}>Haida Gwaii News</Link>
          <div className="hidden items-center justify-center gap-1 text-sm tracking-wide text-slate-800 md:flex">
            {navItems.map((item) => <DesktopDropdown key={item.label} item={item} />)}
            {directLinks.map((link) => <Link key={link.href} href={link.href} className="flex min-h-11 items-center rounded-lg px-2 font-bold hover:bg-slate-100 hover:text-hgnBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue">{link.label}</Link>)}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/search" aria-label="Search" className="grid h-11 w-11 place-items-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue"><Search size={20} /></Link>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hgnBlue md:hidden" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div id="mobile-navigation" className="fixed inset-0 z-[9998] overflow-y-auto bg-white px-4 pb-10 pt-20 md:hidden">
          <nav aria-label="Mobile primary" className="mx-auto max-w-xl space-y-2">
            {navItems.map((item) => (
              <details key={item.label} className="rounded-2xl border border-slate-200 bg-white">
                <summary className="cursor-pointer list-none px-5 py-4 text-lg font-black">{item.label}</summary>
                <div className="border-t border-slate-100 p-2">
                  {item.children.map((child) => (
                    <div key={child.href}>
                      <Link href={child.href} onClick={close} className="block rounded-xl px-4 py-3 font-bold hover:bg-slate-100">{child.label}</Link>
                      {child.children ? <div className="grid grid-cols-2 gap-1 border-l-2 border-slate-100 pl-2">{child.children.map((sub) => <Link key={sub.href} href={sub.href} onClick={close} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">{sub.label}</Link>)}</div> : null}
                    </div>
                  ))}
                </div>
              </details>
            ))}
            {directLinks.map((link) => <Link key={link.href} href={link.href} onClick={close} className="block rounded-2xl border border-slate-200 px-5 py-4 text-lg font-black">{link.label}</Link>)}
          </nav>
        </div>
      ) : null}
    </>
  )
}

export default Header
