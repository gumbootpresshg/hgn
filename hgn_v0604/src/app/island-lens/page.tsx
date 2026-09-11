import { supabase } from "@/lib/supabase"

export const revalidate = 60

export default async function IslandLensPage() {
  const { data, error } = await supabase
    .from("island_lens_items")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)

  const items = data || []

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Photos & Video</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Island Lens</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Photo spreads, event galleries, short videos, community photos, sports clips and local footage.</p>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Island Lens galleries are coming soon.</p>
      ) : (
        <section className="space-y-8">
          {items.map((item: any) => {
            const photos = item.photo_urls || []
            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{item.media_type || "gallery"}</p>
                  <h2 className="mt-2 text-3xl font-black">{item.title}</h2>
                  {item.gallery_intro || item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.gallery_intro || item.description}</p> : null}
                  {item.gallery_body ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.gallery_body}</p> : null}
                  <p className="mt-3 text-xs text-slate-500">{[item.community, item.credit].filter(Boolean).join(" · ")}</p>
                </div>

                {photos.length > 0 ? (
                  <div className="grid gap-2 p-2 md:grid-cols-3">
                    {photos.map((url: string, index: number) => (
                      <img key={url} src={url} alt={`${item.title} photo ${index + 1}`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                ) : item.thumbnail_url || item.media_url ? (
                  <img src={item.thumbnail_url || item.media_url} alt={item.title} className="aspect-[16/9] w-full object-cover" />
                ) : null}
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
