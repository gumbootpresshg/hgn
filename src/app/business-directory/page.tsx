import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const revalidate = 60

export default async function BusinessDirectoryPage() {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("business_name", { ascending: true })

  const businesses = data || []

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Explore Haida Gwaii</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Business Directory</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Local businesses and organizations across Haida Gwaii.</p>
        <Link href="/account/business" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Manage your business listing</Link>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      {businesses.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Business listings are coming soon.</p>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => (
            <article key={business.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              {business.logo_url ? <img src={business.logo_url} alt={business.business_name} className="mb-4 h-20 w-20 rounded-2xl object-cover" /> : null}
              <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{business.category}</p>
              <h2 className="mt-2 text-2xl font-black">{business.business_name}</h2>
              {business.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{business.description}</p> : null}
              <p className="mt-3 text-sm text-slate-500">{[business.community, business.phone].filter(Boolean).join(" · ")}</p>
              {business.website ? <a href={business.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-hgnBlue">Website →</a> : null}
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
