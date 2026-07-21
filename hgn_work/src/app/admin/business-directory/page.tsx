import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const revalidate = 60

export default async function AdminBusinessDirectoryPage() {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  const businesses = data || []

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Business Directory</h1>
        <p className="mt-3 text-slate-600">Review and manage business/organization profiles.</p>
        <Link href="/account/business" className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Add/manage business profile</Link>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {businesses.map((business: any) => (
          <article key={business.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{business.status || "draft"}</p>
            <h2 className="mt-2 text-xl font-black">{business.business_name}</h2>
            <p className="mt-2 text-sm text-slate-600">{[business.category, business.community].filter(Boolean).join(" · ")}</p>
          </article>
        ))}
        {businesses.length === 0 ? <p className="rounded-2xl border bg-white p-6 text-slate-600">No business profiles yet.</p> : null}
      </section>
    </main>
  )
}
