import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const revalidate = 60

export default async function ObituariesPage() {
  const { data, error } = await supabase
    .from("obituaries")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("created_at", { ascending: false })
    .limit(100)

  const obituaries = (data || []).sort((a: any, b: any) => {
    const aDate = new Date(a.death_date || a.created_at || 0).getTime()
    const bDate = new Date(b.death_date || b.created_at || 0).getTime()
    return bDate - aDate
  })

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Community</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Obituaries</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Online obituaries are free. Print obituaries are $100.</p>
        <Link href="/submit-obituary" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Submit an Obituary</Link>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      {obituaries.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No obituaries published yet.</p>
      ) : (
        <section className="space-y-4">
          {obituaries.map((item: any) => (
            <article key={item.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex gap-4">
                {item.photo_url ? <img src={item.photo_url} alt={item.full_name} className="h-24 w-24 rounded-2xl object-cover" /> : null}
                <div>
                  <h2 className="text-2xl font-black">{item.full_name || item.title || "Obituary"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{[item.birth_date, item.death_date].filter(Boolean).join(" – ")}</p>
                  {item.tribute || item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.tribute || item.description}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
