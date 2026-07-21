"use client"

import Link from "next/link"
import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { slugify } from "@/lib/article-routing"

const utilityLinks = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/digital-paper", label: "Archives" },
  { href: "/advertise", label: "Advertise" },
  { href: "/contact", label: "Contact" },
]

const fallbackColumns = [
  "Tlellagram", "Living Out Loud", "Life on the Gwaii", "GKNS Chronicles", "Off Island Antics",
  "Wisdom Beyond", "Island Cuisine", "Science Matters", "Backseat Life-ing", "Book Talk",
  "Gallivanting", "Terry's Take", "Sandspit Shingle", "Masset Matters",
]

type NavLink = { href: string; label: string; children?: NavLink[] }
type NavItem = { label: string; href?: string; children?: NavLink[] }

type DesktopDropdownProps = {
  item: Required<Pick<NavItem, "label" | "children">>
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onNavigate: () => void
}

function DesktopDropdown({ item, isOpen, onOpen, onClose, onNavigate }: DesktopDropdownProps) {
  const wide = item.children.some((child) => child.children?.length)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 16, width: wide ? 792 : 320 })

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openMenu = () => {
    cancelScheduledClose()
    onOpen()
  }

  const scheduleClose = () => {
    cancelScheduledClose()
    closeTimerRef.current = setTimeout(onClose, 450)
  }

  useEffect(() => () => cancelScheduledClose(), [])

  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const sidePadding = 16
      const desiredWidth = wide ? 792 : 320
      const availableWidth = Math.max(240, window.innerWidth - sidePadding * 2)
      const width = Math.min(desiredWidth, availableWidth)
      const preferredLeft = wide ? rect.left + rect.width / 2 - width / 2 : rect.left
      const left = Math.min(
        Math.max(sidePadding, preferredLeft),
        Math.max(sidePadding, window.innerWidth - width - sidePadding),
      )

      setDropdownPosition({ top: rect.bottom - 1, left, width })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true })
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isOpen, wide])

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        className="newspaper-nav-link"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        {item.label}<ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className="fixed z-[10000]"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={scheduleClose}
        >
          <div className="border border-stone-300 bg-[#fffefa] p-3 text-left text-stone-900 shadow-[0_16px_35px_rgba(0,0,0,.14)]">
            <div className={wide ? "grid gap-1 md:grid-cols-2" : "space-y-0.5"}>
              {item.children.map((child) => (
                <div key={child.href} className={child.children ? "md:col-span-2" : ""}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className="block border-b border-stone-200 px-3 py-2.5 font-serif text-base font-bold hover:bg-stone-100 hover:text-hgnRed"
                  >
                    {child.label}
                  </Link>
                  {child.children ? (
                    <div className="grid gap-x-4 px-2 py-2 sm:grid-cols-2 lg:grid-cols-3">
                      {child.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onNavigate}
                          className="border-b border-stone-100 px-2 py-2 text-sm text-stone-700 hover:text-hgnRed"
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
        </div>
      ) : null}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement | null>(null)
  const [isStuck, setIsStuck] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null)
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
    if (!mobileOpen) return
    const scrollY = window.scrollY
    const previousBody = { overflow: document.body.style.overflow, position: document.body.style.position, top: document.body.style.top, width: document.body.style.width }
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = "100%"
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBody.overflow
      document.body.style.position = previousBody.position
      document.body.style.top = previousBody.top
      document.body.style.width = previousBody.width
      window.scrollTo(0, scrollY)
    }
  }, [mobileOpen])

  useEffect(() => {
    setOpenDesktopMenu(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null)
        setMobileOpen(false)
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenDesktopMenu(null)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [])

  const navItems: NavItem[] = useMemo(() => [
    {
      label: "News",
      children: [
        { href: "/articles", label: "Latest Stories" },
        { href: "/news", label: "Local News" },
        { href: "/mountie-minute", label: "Mountie Minute" },
        { href: "/sports", label: "Sports" },
      ],
    },
    {
      label: "Opinion",
      children: [
        { href: "/columns", label: "Columns", children: columns },
        { href: "/letters", label: "Letters to the Editor" },
        { href: "/submit-guest-opinion", label: "Submit a Guest Opinion" },
      ],
    },
    { label: "Weather", href: "/weather" },
    {
      label: "Community",
      children: [
        { href: "/events", label: "Events" },
        { href: "/obituaries", label: "Obituaries" },
        { href: "/ferry-info", label: "Ferry Info" },
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
      ],
    },
    { label: "Horoscopes", href: "/horoscope" },
    {
      label: "Haida Gwaii Guide",
      children: [
        { href: "/explore", label: "Guide Home" },
        { href: "/explore/map", label: "Island Map" },
        { href: "/explore/travel", label: "Ferries & Travel" },
        { href: "/explore/cams", label: "Island Cams" },
        { href: "/explore/directory", label: "Directory" },
      ],
    },
  ], [columns])

  const closeAllMenus = () => {
    setOpenDesktopMenu(null)
    setMobileOpen(false)
  }

  return (
    <>
      <header id="hgn-masthead" className="relative z-40 bg-[#fffefa] text-stone-950">
        <div className="border-b border-stone-300">
          <div className="mx-auto grid max-w-[1480px] gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-stone-600 md:grid-cols-3 md:items-center md:px-7">
            <div className="font-semibold normal-case tracking-normal">{today}</div>
            <div className="hidden text-center font-bold tracking-[0.2em] lg:block">Independent local journalism</div>
            <nav aria-label="Utility" className="flex flex-wrap items-center gap-3 md:justify-end">
              {utilityLinks.map((link) => <Link key={link.href} href={link.href} className="hover:text-hgnRed">{link.label}</Link>)}
              <Link href="/account" aria-label="My account" className="inline-flex items-center gap-1 hover:text-hgnRed"><UserRound size={14} /> My HGN</Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-[1480px] px-4 py-5 text-center md:px-7 md:py-7">
          <Link href="/" className="masthead-wordmark">Haida Gwaii News</Link>
          <div className="mt-2 flex items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500 sm:text-xs">
            <span className="hidden h-px w-20 bg-stone-400 sm:block" />
            The Islands&apos; News Source Since 2024
            <span className="hidden h-px w-20 bg-stone-400 sm:block" />
          </div>
        </div>
      </header>

      <div className={isStuck ? "h-[49px]" : ""} aria-hidden="true" />
      <nav ref={navRef} aria-label="Primary" className={`z-[9999] border-y border-stone-900 bg-[#fffefa] ${isStuck ? "fixed inset-x-0 top-0 border-b-2 shadow-[0_6px_18px_rgba(0,0,0,0.14)]" : "relative"}`}>
        <div className={`mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-4 md:px-7 ${isStuck ? "min-h-11" : "min-h-12"}`}>
          <Link href="/" onClick={closeAllMenus} className={`${isStuck ? "block" : "md:hidden"} shrink-0 border-r border-stone-300 pr-3 font-serif text-base font-bold tracking-tight`}>HGN</Link>
          <div className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            {navItems.map((item) => item.children ? (
              <DesktopDropdown
                key={item.label}
                item={{ label: item.label, children: item.children }}
                isOpen={openDesktopMenu === item.label}
                onOpen={() => setOpenDesktopMenu(item.label)}
                onClose={() => setOpenDesktopMenu((current) => current === item.label ? null : current)}
                onNavigate={closeAllMenus}
              />
            ) : (
              <Link key={item.label} href={item.href ?? "/"} onClick={closeAllMenus} className="newspaper-nav-link">{item.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/search" onClick={closeAllMenus} aria-label="Search" className="grid h-10 w-10 place-items-center hover:text-hgnRed"><Search size={19} strokeWidth={1.7} /></Link>
            <button type="button" className="grid h-10 w-10 place-items-center md:hidden" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div id="mobile-navigation" className="fixed inset-0 z-[10050] flex h-[100dvh] flex-col overflow-hidden bg-[#fffefa] md:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-stone-900 px-4 py-2">
            <Link href="/" onClick={closeAllMenus} className="border-r border-stone-300 pr-4 font-serif text-xl font-bold">HGN</Link>
            <div className="flex items-center gap-1">
              <Link href="/search" onClick={closeAllMenus} aria-label="Search" className="grid h-10 w-10 place-items-center"><Search size={20} strokeWidth={1.7} /></Link>
              <button type="button" className="grid h-10 w-10 place-items-center" aria-label="Close menu" onClick={closeAllMenus}><X size={24} /></button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-4 [-webkit-overflow-scrolling:touch]">
          <nav aria-label="Mobile primary" className="mx-auto max-w-xl border-t border-stone-900">
            {navItems.map((item) => item.children ? (
              <details key={item.label} className="border-b border-stone-300">
                <summary className="cursor-pointer list-none px-1 py-4 font-serif text-xl font-bold">{item.label}</summary>
                <div className="border-t border-stone-200 pb-2">
                  {item.children.map((child) => (
                    <div key={child.href}>
                      <Link href={child.href} onClick={closeAllMenus} className="block border-b border-stone-100 px-3 py-3 font-semibold">{child.label}</Link>
                      {child.children ? <div className="grid grid-cols-2 gap-x-3 px-3 py-2">{child.children.map((sub) => <Link key={sub.href} href={sub.href} onClick={closeAllMenus} className="border-b border-stone-100 py-2 text-sm text-stone-600">{sub.label}</Link>)}</div> : null}
                    </div>
                  ))}
                </div>
              </details>
            ) : (
              <Link key={item.label} href={item.href ?? "/"} onClick={closeAllMenus} className="block border-b border-stone-300 px-1 py-4 font-serif text-xl font-bold">{item.label}</Link>
            ))}
            <div className="grid grid-cols-2 gap-2 py-5 text-sm font-semibold">
              {utilityLinks.map((link) => <Link key={link.href} href={link.href} onClick={closeAllMenus} className="border border-stone-300 px-3 py-3 text-center">{link.label}</Link>)}
              <Link href="/account" onClick={closeAllMenus} className="border border-stone-300 px-3 py-3 text-center">My HGN</Link>
            </div>
          </nav>
          </div>
        </div>
      ) : null}
    </>
  )
}
