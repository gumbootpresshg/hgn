import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdSlot from "@/components/AdSlot";
import { getArticleImage } from "@/lib/article-images";
import { formatPublishingDate, getPublishingSettings } from "@/lib/publishing-settings";
import { isLetter, isOpinion, sortArticlesNewest } from "@/lib/article-routing";

export const revalidate = 60;

type PageProps = { searchParams?: Promise<{ category?: string; q?: string }> };
type Article = { id:string; title:string; slug:string; excerpt?:string|null; body?:string|null; author_name?:string|null; category?:string|null; subcategory?:string|null; column_name?:string|null; image_url?:string|null; cover_image_url?:string|null; image_alt?:string|null; published_at?:string|null; featured?:boolean|null };

const separateSections = new Set(["letter","letters","letters to the editor","editorial","editorials","opinion","column","columns","community voices"]);
function isNewsCategory(cat?:string|null){ const v=String(cat||"").trim().toLowerCase(); return v && !separateSections.has(v); }
function excerpt(a:Article){ return a.excerpt || a.body?.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,220) || ""; }

export default async function Articles({searchParams}:PageProps){
  const settings=await getPublishingSettings();
  const sp=searchParams?await searchParams:{}; const selected=sp.category||""; const q=(sp.q||"").trim();
  const [{data:categoryRows},{data:featuredRows},{data:authorRows}]=await Promise.all([
    supabase.from("articles").select("category").eq("status","published").not("category","is",null).limit(2000),
    supabase.from("articles").select("*").eq("status","published").eq("featured",true).order("published_at",{ascending:false}).limit(6),
    supabase.from("hgn_authors").select("id,display_name,slug,writer_type,photo_url").eq("is_active",true).order("sort_order",{ascending:true}).limit(6),
  ]);
  const categories=Array.from(new Set((categoryRows||[]).map((r:any)=>r.category).filter(isNewsCategory))).sort();
  let query=supabase.from("articles").select("*").eq("status","published").order("published_at",{ascending:false}).limit(120);
  if(selected&&isNewsCategory(selected)) query=query.eq("category",selected);
  if(q) query=query.or(`title.ilike.%${q.replace(/[%_,]/g," ")}%,excerpt.ilike.%${q.replace(/[%_,]/g," ")}%,author_name.ilike.%${q.replace(/[%_,]/g," ")}%,column_name.ilike.%${q.replace(/[%_,]/g," ")}%`);
  const {data}=await query;
  const articles=sortArticlesNewest((data||[]).filter((a:any)=>!isOpinion(a)&&!isLetter(a)));
  const top=sortArticlesNewest((featuredRows||[]).filter((a:any)=>!isOpinion(a)&&!isLetter(a))).slice(0,5);
  const lead=!q&&!selected?articles[0]:null; const recent=lead?articles.slice(1):articles;
  return <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
    <header className="border-b-4 border-double border-slate-900 pb-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-hgnBlue">Haida Gwaii News</p>
      <h1 className="mt-2 font-serif text-4xl font-black text-hgnNavy md:text-6xl">Latest Articles</h1>
      <p className="mt-3 max-w-2xl text-slate-600">The newest reporting from across Haida Gwaii, with simple ways to find sections, writers, columns and older stories.</p>
    </header>

    <section className="mt-6 rounded-2xl border bg-slate-50 p-4 md:p-5">
      <form action="/articles" className="flex flex-col gap-3 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search headlines, topics, writers or columns" className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-3 text-base outline-none focus:border-hgnBlue" />
        {selected?<input type="hidden" name="category" value={selected}/>:null}
        <button className="rounded-lg bg-hgnNavy px-6 py-3 font-black text-white">Search articles</button>
      </form>
      {(q||selected)?<div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-slate-600">{articles.length} result{articles.length===1?"":"s"}{q?` for “${q}”`:""}{selected?` in ${selected}`:""}</span><Link href="/articles" className="font-bold text-hgnBlue hover:underline">Clear filters</Link></div>:null}
    </section>

    {!q&&!selected&&lead?<section className="mt-8 grid gap-5 border-b pb-8 lg:grid-cols-[1.35fr_.65fr]">
      <Link href={`/articles/${lead.slug}`} className="group block">{getArticleImage(lead)?<img src={getArticleImage(lead)||""} alt={lead.image_alt||lead.title} className="aspect-[16/9] w-full object-cover"/>:null}<p className="mt-4 text-xs font-black uppercase tracking-wider text-hgnBlue">{lead.subcategory||lead.category||"Latest"}</p><h2 className="mt-2 font-serif text-3xl font-black leading-tight group-hover:underline md:text-4xl">{lead.title}</h2><p className="mt-3 text-slate-600">{excerpt(lead)}</p></Link>
      <div className="divide-y border-t lg:border-t-0">{recent.slice(0,4).map((a:Article)=><Link key={a.id} href={`/articles/${a.slug}`} className="group grid grid-cols-[1fr_100px] gap-3 py-4 first:pt-0"><div><p className="text-xs font-black uppercase text-hgnBlue">{a.subcategory||a.category||"News"}</p><h3 className="mt-1 font-serif text-xl font-black leading-tight group-hover:underline">{a.title}</h3><p className="mt-2 text-xs text-slate-500">{a.author_name||"Haida Gwaii News"}</p></div>{getArticleImage(a)?<img src={getArticleImage(a)||""} alt="" className="h-24 w-full object-cover"/>:null}</Link>)}</div>
    </section>:null}

    <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="flex items-end justify-between border-b-2 border-slate-900 pb-2"><h2 className="font-serif text-3xl font-black">{q||selected?"Search results":"More recent articles"}</h2></div>
        <div className="divide-y">{(lead?recent.slice(4):recent).map((a:Article,i:number)=><div key={a.id}><Link href={`/articles/${a.slug}`} className="group grid gap-4 py-6 sm:grid-cols-[180px_1fr]">{getArticleImage(a)?<img src={getArticleImage(a)||""} alt={a.image_alt||a.title} className="h-32 w-full object-cover"/>:<div className="hidden h-32 bg-slate-100 sm:block"/>}<div><p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{a.subcategory||a.category||"News"}</p><h3 className="mt-1 font-serif text-2xl font-black leading-tight group-hover:underline">{a.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{excerpt(a)}</p><p className="mt-2 text-xs text-slate-500">{a.author_name||"Haida Gwaii News"}{a.published_at?` · ${formatPublishingDate(a.published_at,settings)}`:""}</p></div></Link>{(i+1)%6===0?<AdSlot placement="article-feed"/>:null}</div>)}</div>
        {!articles.length?<p className="py-10 text-slate-600">No articles matched that search. Try a broader word or clear the filters.</p>:null}
      </div>

      <aside className="space-y-7">
        <section className="border-t-4 border-hgnNavy pt-4"><h2 className="font-serif text-2xl font-black">Browse HGN</h2><div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-bold"><Link href="/articles">Latest</Link>{categories.slice(0,8).map(cat=><Link key={cat} href={`/articles?category=${encodeURIComponent(cat)}`} className="hover:text-hgnBlue">{cat}</Link>)}<Link href="/opinion">Opinion</Link><Link href="/columns">Columns</Link><Link href="/letters">Letters</Link><Link href="/events">Community</Link></div></section>
        {top.length?<section className="border-t pt-4"><h2 className="font-serif text-2xl font-black">Top Stories</h2><div className="mt-2 divide-y">{top.map((a:Article,n:number)=><Link key={a.id} href={`/articles/${a.slug}`} className="group flex gap-3 py-3"><span className="font-serif text-2xl font-black text-slate-300">{n+1}</span><span className="font-bold leading-snug group-hover:underline">{a.title}</span></Link>)}</div></section>:null}
        <AdSlot placement="sidebar-top"/>
      </aside>
    </section>

    <section className="mt-12 border-t-4 border-double border-slate-900 pt-6"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-hgnBlue">Voices of the islands</p><h2 className="mt-1 font-serif text-3xl font-black">Writers &amp; Columnists</h2></div><Link href="/authors" className="text-sm font-black text-hgnBlue hover:underline">Meet all writers →</Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(authorRows||[]).map((a:any)=><Link key={a.id} href={`/authors/${a.slug}`} className="flex items-center gap-4 border-t py-4 group">{a.photo_url?<img src={a.photo_url} alt={a.display_name} className="h-14 w-14 rounded-full object-cover"/>:<div className="grid h-14 w-14 rounded-full bg-slate-100 place-items-center font-serif text-xl font-black">{a.display_name?.slice(0,1)}</div>}<div><h3 className="font-serif text-xl font-black group-hover:underline">{a.display_name}</h3><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{a.writer_type||"Writer"}</p></div></Link>)}</div><div className="mt-4 flex flex-wrap gap-3"><Link href="/columns" className="rounded-lg border px-4 py-2 text-sm font-black hover:bg-slate-50">Browse all columns</Link><Link href="/authors" className="rounded-lg border px-4 py-2 text-sm font-black hover:bg-slate-50">Browse all writers</Link><Link href="/digital-paper" className="rounded-lg border px-4 py-2 text-sm font-black hover:bg-slate-50">Browse newspaper archive</Link></div></section>
  </main>;
}
