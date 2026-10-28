import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { supabase } from "@/lib/supabase";

export const metadata = pageMetadata("Obituaries", "Remembering people from Haida Gwaii and sharing obituary notices.", "/obituaries");
export const revalidate = 60;

const publicStatuses = ["published", "approved", "public", "live", "active"];

function dateValue(item: { published_at?: string | null; death_date?: string | null; created_at?: string | null }) {
  return new Date(item.published_at || item.death_date || item.created_at || 0).getTime();
}

export default async function ObituariesPage() {
  const [{ data: obituaryRows, error: obituaryError }, { data: articleRows, error: articleError }] = await Promise.all([
    supabase.from("obituaries").select("*").in("status", publicStatuses).order("published_at", { ascending: false }).order("created_at", { ascending: false }).limit(100),
    // Older HGN entries may have been published through the regular article editor.
    supabase.from("articles").select("id,title,slug,excerpt,image_url,published_at,created_at").eq("status", "published").or("category.ilike.%obituar%,subcategory.ilike.%obituar%,section.ilike.%obituar%").order("published_at", { ascending: false }).limit(100),
  ]);
  const obituaries = [...(obituaryRows || [])].sort((a: any, b: any) => dateValue(b) - dateValue(a));
  const articleObituaries = articleRows || [];
  const errors = [obituaryError, articleError].filter(Boolean);

  return <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
    <section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Community</p><h1 className="mt-3 text-5xl font-black tracking-tight">Obituaries</h1><p className="mt-4 max-w-3xl text-slate-600">Online obituaries are free. Print obituaries are $100.</p><Link href="/submit-obituary" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Submit an Obituary</Link></section>
    {errors.map((error: any) => <p key={error.message} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p>)}
    {!obituaries.length && !articleObituaries.length ? <p className="rounded-2xl border bg-white p-6 text-slate-600">No obituaries published yet.</p> : null}
    {obituaries.length ? <section className="space-y-4">{obituaries.map((item: any) => { const name = item.full_name || item.name || item.title || "Obituary"; const dates = item.dates || [item.birth_date, item.death_date].filter(Boolean).join(" – "); const details = item.tribute || item.description || item.details || item.notice; const image = item.photo_url || item.image_url; return <article key={item.id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex gap-4">{image ? <img src={image} alt={name} className="h-24 w-24 rounded-2xl object-cover" /> : null}<div><h2 className="text-2xl font-black">{name}</h2>{dates ? <p className="mt-1 text-sm text-slate-500">{dates}</p> : null}{details ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{details}</p> : null}</div></div></article>; })}</section> : null}
    {articleObituaries.length ? <section className="space-y-4"><h2 className="border-b border-slate-300 pb-3 text-2xl font-black">Obituary notices</h2>{articleObituaries.map((article: any) => <article key={article.id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex gap-4">{article.image_url ? <img src={article.image_url} alt="" className="h-24 w-24 rounded-2xl object-cover" /> : null}<div><Link href={`/articles/${article.slug}`} className="text-2xl font-black hover:text-hgnBlue hover:underline">{article.title}</Link>{article.excerpt ? <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p> : null}<Link href={`/articles/${article.slug}`} className="mt-3 inline-block text-sm font-bold text-hgnBlue hover:underline">Read obituary →</Link></div></div></article>)}</section> : null}
  </main>;
}
