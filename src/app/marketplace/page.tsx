import { formatPrice } from "@/lib/marketplace-options"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  categoryIcon,
  categoryLabel,
  isPostedToday,
  marketplaceGroups,
  normalizedCategory,
  primaryPhoto,
} from "@/lib/marketplace"

export const revalidate = 0

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: Promise<{
    category?: string
    q?: string
    town?: string
    condition?: string
    today?: string
  }>
}) {
  const params = await searchParams
  const selected = params?.category || "all"
  const q = String(params?.q || "").trim().toLowerCase()
  const town = String(params?.town || "").trim()
  const condition = String(params?.condition || "").trim()
  const todayOnly = params?.today === "1"

  const { data, error } = await supabase
    .from("classifieds")
    .select("*")
    .in("status", ["approved", "published", "public", "live", "active"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300)

  const allListings = data || []

  const listings = allListings.filter((item: any) => {
    const category = normalizedCategory(item)
    const haystack = `${item.title || ""} ${item.description || ""} ${item.town || ""} ${item.location || ""} ${item.price || ""}`.toLowerCase()

    if (selected !== "all" && category !== selected) return false
    if (q && !haystack.includes(q)) return false
    if (town && String(item.town || item.location || "").toLowerCase() !== town.toLowerCase()) return false
    if (condition && String(item.condition || "").toLowerCase() !== condition.toLowerCase()) return false
    if (todayOnly && !isPostedToday(item.created_at)) return false
    return true
  })

  const towns = Array.from(new Set(allListings.map((item: any) => item.town || item.location).filter(Boolean))).sort()
  const promoted = allListings.filter((item: any) => item.is_featured).slice(0, 3)

  function countFor(slug: string) {
    if (slug === "all") return allListings.length
    return allListings.filter((item: any) => normalizedCategory(item) === slug).length
  }

  const queryBase = new URLSearchParams()
  if (q) queryBase.set("q", q)
  if (town) queryBase.set("town", town)
  if (condition) queryBase.set("condition", condition)
  if (todayOnly) queryBase.set("today", "1")

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Haida Gwaii Marketplace</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Marketplace</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Buy, sell, rent, hire and browse local listings across Haida Gwaii.
            </p>
          </div>

          <Link href="/submit-classified" className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-bold text-white">
            Post a Listing
          </Link>
        </div>

        <form className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_auto]" action="/marketplace">
          <input name="q" defaultValue={params?.q || ""} placeholder="Search Marketplace" className="rounded-2xl border px-4 py-3" />

          <select name="town" defaultValue={town} className="rounded-2xl border px-4 py-3">
            <option value="">All communities</option>
            {towns.map((townName: any) => <option key={townName} value={townName}>{townName}</option>)}
          </select>


          <input type="hidden" name="category" value={selected} />
          <button className="rounded-full bg-hgnBlue px-6 py-3 text-sm font-black text-white">Search</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={todayOnly} href={`/marketplace?${toggleParam(queryBase, "today", todayOnly ? "" : "1")}`}>Posted Today</FilterChip>
          <Link href="/marketplace" className="rounded-full border px-4 py-2 text-sm font-bold">Clear filters</Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[285px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-3xl border bg-white p-4 shadow-sm">
            <h2 className="px-2 text-lg font-black">Categories</h2>

            <div className="mt-4 space-y-5">
              {marketplaceGroups.map((group) => (
                <details key={group.title} open className="group">
                  <summary className="cursor-pointer list-none px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    {group.title}
                  </summary>

                  <nav className="mt-2 space-y-1">
                    {group.items.map((category) => {
                      const active = selected === category.slug
                      const next = new URLSearchParams(queryBase)
                      next.set("category", category.slug)
                      return (
                        <Link
                          key={category.slug}
                          href={`/marketplace?${next.toString()}`}
                          className={[
                            "flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-bold",
                            active ? "bg-slate-950 text-white" : "hover:bg-slate-100",
                          ].join(" ")}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="w-6 text-center">{category.icon}</span>
                            <span className="truncate">{category.label}</span>
                          </span>
                          <span className={active ? "text-white/70" : "text-slate-400"}>{countFor(category.slug)}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </details>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          {promoted.length > 0 ? (
            <section className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Featured Sponsors</p>
                  <h2 className="mt-1 text-2xl font-black">Promoted Listings</h2>
                </div>
                <Link href="/marketplace" className="text-sm font-bold text-hgnBlue">View all →</Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {promoted.map((item: any) => <MiniCard key={item.id} item={item} />)}
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{categoryLabel(selected)}</h2>
              <p className="text-sm text-slate-500">{listings.length} listing{listings.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/marketplace?category=vehicles-boats" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:text-hgnBlue">Vehicles & Boats</Link>
              <Link href="/marketplace?category=real-estate" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:text-hgnBlue">Real Estate</Link>
              <Link href="/marketplace?category=rentals" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:text-hgnBlue">Rentals</Link>
            </div>
          </div>

          {error ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p>
          ) : null}

          {listings.length === 0 ? (
            <p className="rounded-2xl border bg-white p-6 text-slate-600">No listings found. Try clearing filters or posting the first listing in this category.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((item: any) => <ListingCard key={item.id} item={item} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function toggleParam(base: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(base)
  if (value) next.set(key, value)
  else next.delete(key)
  return next.toString()
}

function FilterChip({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={["rounded-full px-4 py-2 text-sm font-bold", active ? "bg-slate-950 text-white" : "border"].join(" ")}>
      {children}
    </Link>
  )
}

function ListingCard({ item }: { item: any }) {
  const category = normalizedCategory(item)
  const photo = primaryPhoto(item)

  return (
    <Link href={`/marketplace/${item.id}`} className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md">
      <div className="relative">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.title || "Marketplace listing"} className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-100 text-slate-400">No photo</div>
        )}
        {item.is_featured ? <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-hgnBlue shadow-sm">Featured</span> : null}
        {isPostedToday(item.created_at) ? <span className="absolute right-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white shadow-sm">Today</span> : null}
      </div>

      <div className="p-4">
        <p className="text-xl font-black">{formatPrice(item.price_amount || item.price)}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-black">{item.title || "Untitled listing"}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description || "No description provided."}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          <span>{categoryIcon(category)} {categoryLabel(category)}</span>
          <span>•</span>
          <span>{item.town || item.location || "Haida Gwaii"}</span>
        </div>
      </div>
    </Link>
  )
}

function MiniCard({ item }: { item: any }) {
  const photo = primaryPhoto(item)
  return (
    <Link href={`/marketplace/${item.id}`} className="flex gap-3 rounded-2xl border bg-slate-50 p-3 hover:border-hgnBlue">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={item.title || "Listing"} className="h-20 w-20 rounded-xl object-cover" />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-500">No photo</div>
      )}
      <div className="min-w-0">
        <p className="font-black">{item.price || "Contact"}</p>
        <p className="line-clamp-2 text-sm font-bold">{item.title || "Untitled listing"}</p>
        <p className="mt-1 text-xs text-slate-500">{item.town || item.location || "Haida Gwaii"}</p>
      </div>
    </Link>
  )
}
