"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { slugify } from "@/lib/article-routing"

const utilityLinks = [
  { href: "/account", label: "My HGN" },
  { href: "/search", label: "🔍 Search" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/advertise", label: "Advertise" },
]

const fallbackColumns = [
  "Tlellagram",
  "Living Out Loud",
  "Life on the Gwaii",
  "GKNS Chronicles",
  "Off Island Antics",
  "Wisdom Beyond",
  "Island Cuisine",
  "Science Matters",
  "Backseat Life-ing",
  "Book Talk",
  "Gallivanting",
  "Terry's Take",
  "Sandspit Shingle",
  "Masset Matters",
]

type NavLink = {
  href: string
  label: string
  children?: NavLink[]
}

function Dropdown({ label, children }: { label: string; children: NavLink[] }) {
  return (
    <div className="group relative -mb-3 shrink-0 pb-3">
      <button className="flex items-center gap-1 whitespace-nowrap hover:text-hgnBlue">
        {label}
        <span aria-hidden="true">▾</span>
      </button>

      <div className="invisible absolute left-1/2 top-full z-[10000] max-h-[70vh] min-w-72 -translate-x-1/2 overflow-visible rounded-b-2xl border border-slate-200 bg-white p-2 text-left tracking-normal text-slate-800 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {children.map((child) => (
          <div key={child.href} className="group/sub relative">
            <Link
              href={child.href}
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-100 hover:text-hgnBlue"
            >
              <span>{child.label}</span>
              {child.children ? <span aria-hidden="true">›</span> : null}
            </Link>

            {child.children ? (
              <div className="invisible absolute left-full top-0 z-[10001] ml-1 max-h-[70vh] min-w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover/sub:visible group-hover/sub:opacity-100">
                {child.children.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-100 hover:text-hgnBlue"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Header() {
  const [isStuck, setIsStuck] = useState(false)
  const [today, setToday] = useState("")
  const columns = useMemo(
    () => fallbackColumns.map((name) => ({ href: `/columns/${slugify(name)}`, label: name })),
    []
  )

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date())
    )

    function onScroll() {
      const masthead = document.getElementById("hgn-masthead")
      const bottom = masthead?.getBoundingClientRect().bottom ?? 0
      setIsStuck(bottom <= 0)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const navItems = useMemo(
    () => [
      {
        label: "News",
        children: [
          { href: "/news", label: "Local News" },
          { href: "/sports", label: "Sports" },
          { href: "/mountie-minute", label: "Mountie Minute" },
        ],
      },
      {
        label: "Opinion",
        children: [
          { href: "/opinion/editorials", label: "Editorials" },
          { href: "/columns", label: "Columns", children: columns },
          { href: "/letters", label: "Letters to the Editor" },
          { href: "/submit-guest-opinion", label: "Submit a Guest Opinion" },
          { href: "/submit-letter", label: "Submit a Letter" },
        ],
      },
      {
        label: "Marketplace",
        children: [
          { href: "/marketplace", label: "All Listings" },
          { href: "/marketplace/post", label: "Post Ad" },
          { href: "/marketplace/my-listings", label: "My Listings" },
          { href: "/marketplace?category=vehicles-boats", label: "Vehicles & Boats" },
          { href: "/marketplace?category=real-estate", label: "Real Estate" },
          { href: "/marketplace?category=rentals", label: "Rentals" },
          { href: "/marketplace?category=jobs", label: "Jobs" },
          { href: "/marketplace?category=services", label: "Services" },
          { href: "/marketplace?category=notices", label: "Notices" },
        ],
      },
      {
        label: "Weather",
        children: [
          { href: "/weather", label: "Weather Desk" },
          { href: "/weather/tides", label: "Tide Desk" },
          { href: "/weather/earthquakes", label: "Earthquakes" },
          { href: "/weather/tsunami-alerts", label: "Tsunami Alerts" },
        ],
      },
      {
        label: "Explore Haida Gwaii",
        children: [
          { href: "/live-map", label: "Live Map" },
          { href: "/ferry-info", label: "Ferry Info" },
          { href: "/explore/live", label: "Live Utilities" },
          { href: "/explore/live/power-outages", label: "Power Outages" },
        ],
      },
      {
        label: "Horoscope",
        children: [
          { href: "/horoscope", label: "Horoscope" },
        ],
      },
    ],
    [columns]
  )

  return (
    <>
      <header id="hgn-masthead" className="relative z-40 border-b border-slate-300 bg-white">
        <div className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-2 text-xs text-slate-600 md:grid-cols-3 md:items-center">
            <div className="font-semibold">{today}</div>
            <div className="text-center font-semibold tracking-[0.12em]">Independent free local journalism</div>
            <nav className="flex flex-wrap justify-start gap-3 md:justify-end">
              {utilityLinks.map((link) => (
                <Link key={link.href} href={link.href} className="font-semibold hover:text-hgnBlue">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5 text-center">
          <Link href="/" className="font-serif text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
            Haida Gwaii News
          </Link>
        </div>
      </header>

      <div className={isStuck ? "h-[51px]" : ""} aria-hidden="true" />

      <nav
        className={[
          "z-[9999] border-b border-t border-slate-300 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90",
          isStuck ? "fixed left-0 right-0 top-0" : "relative",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-sm font-semibold tracking-wide text-slate-800">
          <Link
            href="/"
            className={[
              "mr-2 shrink-0 font-serif text-lg font-black tracking-tight text-slate-950 transition-all duration-200",
              isStuck ? "inline-block opacity-100" : "hidden opacity-0",
            ].join(" ")}
          >
            Haida Gwaii News
          </Link>

          {navItems.map((item) => (
            <Dropdown key={item.label} label={item.label} children={item.children} />
          ))}

          <Link href="/events" className="shrink-0 whitespace-nowrap hover:text-hgnBlue">Events</Link>
          <Link href="/obituaries" className="shrink-0 whitespace-nowrap hover:text-hgnBlue">Obituaries</Link>
          <Link href="/horoscope" className="shrink-0 whitespace-nowrap hover:text-hgnBlue">Horoscope</Link>
        </div>
      </nav>
    </>
  )
}

export default Header
