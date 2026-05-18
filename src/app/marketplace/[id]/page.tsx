import { formatPrice } from "@/lib/marketplace-options"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { allPhotos, categoryIcon, categoryLabel, isPostedToday, normalizedCategory } from "@/lib/marketplace"

export const revalidate = 0

export default async function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: item, error } = await supabase
    .from("classifieds")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !item) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Listing not found.</p>
      </main>
    )
  }

  const category = normalizedCategory(item)
  const photos = allPhotos(item)

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <Link href={`/marketplace?category=${category}`} className="text-sm font-bold text-hgnBlue">
        ← Back to {categoryLabel(category)}
      </Link>

      <article className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={item.title || "Marketplace listing"} className="max-h-[560px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-slate-100 text-slate-400">No photo</div>
            )}
          </div>

          {photos.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {photos.slice(1, 9).map((photo: string) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={photo} src={photo} alt={item.title || "Marketplace listing"} className="aspect-square rounded-2xl border object-cover" />
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{categoryIcon(category)} {categoryLabel(category)}</span>
            {item.is_featured ? <span className="rounded-full bg-hgnBlue/10 px-3 py-1 text-xs font-black text-hgnBlue">Featured</span> : null}
            {isPostedToday(item.created_at) ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Posted Today</span> : null}
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight">{item.title || "Untitled listing"}</h1>
          <p className="mt-4 text-3xl font-black">{formatPrice(item.price_amount || item.price)}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{item.town || item.location || "Haida Gwaii"}</p>

          <div className="mt-6 grid gap-3 border-t pt-6 text-sm text-slate-600">
            {item.condition ? <p><strong>Condition:</strong> {item.condition}</p> : null}
            {item.delivery_available ? <p><strong>Delivery:</strong> Available</p> : null}
            {item.year || item.make || item.model ? <p><strong>Vehicle/boat:</strong> {[item.year, item.make, item.model].filter(Boolean).join(" ")}</p> : null}
            {item.bedrooms || item.bathrooms ? <p><strong>Property:</strong> {[item.bedrooms ? `${item.bedrooms} bed` : null, item.bathrooms ? `${item.bathrooms} bath` : null].filter(Boolean).join(" · ")}</p> : null}
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-black">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.description || "No description provided."}</p>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-black">Contact</h2>
            <p className="mt-3 text-sm text-slate-700">{item.contact_name || "Seller"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.contact_email ? <a href={`mailto:${item.contact_email}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Email seller</a> : null}
              {item.phone ? <a href={`tel:${item.phone}`} className="rounded-full border px-5 py-3 text-sm font-bold">Call seller</a> : null}
            </div>
          </div>
        </section>
      </article>
    </main>
  )
}
