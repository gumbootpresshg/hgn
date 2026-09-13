import Link from "next/link"
import { supabase } from "@/lib/supabase"
export const revalidate=0
function cleanQ(q:string){return q.replace(/[,%()]/g,' ').replace(/\s+/g,' ').trim()}
export default async function SearchPage({searchParams}:{searchParams?:Promise<{q?:string}>}){const params=await searchParams;const q=cleanQ(String(params?.q||''));let groups:{title:string;items:any[]}[]=[];if(q){const like=`%${q}%`;const [articles,pages,events,obits,notices,editions,authors]=await Promise.all([
  supabase.from('articles').select('id,title,slug,excerpt,body,published_at').in('status',['published','approved','public','live','active']).or(`title.ilike.${like},body.ilike.${like},excerpt.ilike.${like}`).order('published_at',{ascending:false,nullsFirst:false}).limit(30),
  supabase.from('hgn_site_pages').select('id,title,slug,description').eq('status','published').eq('visibility','public').or(`title.ilike.${like},description.ilike.${like}`).limit(20),
  supabase.from('event_submissions').select('id,title,description,start_date,location,community').eq('status','approved').or(`title.ilike.${like},description.ilike.${like},location.ilike.${like},community.ilike.${like}`).limit(20),
  supabase.from('obituaries').select('id,name,body,published_at').in('status',['approved','published']).or(`name.ilike.${like},body.ilike.${like}`).limit(20),
  supabase.from('notices').select('id,title,name,message,created_at').in('status',['approved','published']).or(`title.ilike.${like},name.ilike.${like},message.ilike.${like}`).limit(20),
  supabase.from('digital_editions').select('id,title,issue_date,description,pdf_url').eq('status','published').or(`title.ilike.${like},description.ilike.${like}`).limit(20),
  supabase.from('hgn_authors').select('id,name,slug,short_bio').eq('is_active',true).or(`name.ilike.${like},short_bio.ilike.${like}`).limit(20),
]);groups=[
  {title:'Stories',items:(articles.data||[]).map((x:any)=>({...x,href:`/articles/${x.slug}`,summary:x.excerpt||String(x.body||'').replace(/<[^>]+>/g,' ').slice(0,160)}))},
  {title:'Pages',items:(pages.data||[]).map((x:any)=>({...x,href:`/pages/${x.slug}`,summary:x.description}))},
  {title:'Events',items:(events.data||[]).map((x:any)=>({...x,href:'/events',summary:[x.start_date,x.location,x.community,x.description].filter(Boolean).join(' · ')}))},
  {title:'Obituaries',items:(obits.data||[]).map((x:any)=>({title:x.name,href:'/obituaries',summary:String(x.body||'').slice(0,160)}))},
  {title:'Notices',items:(notices.data||[]).map((x:any)=>({title:x.title||x.name||'Notice',href:'/notices',summary:String(x.message||'').slice(0,160)}))},
  {title:'Archive editions',items:(editions.data||[]).map((x:any)=>({title:x.title,href:x.pdf_url||'/digital-paper',summary:[x.issue_date,x.description].filter(Boolean).join(' · ')}))},
  {title:'Writers',items:(authors.data||[]).map((x:any)=>({title:x.name,href:`/authors/${x.slug}`,summary:x.short_bio}))},
].filter(g=>g.items.length)}return <main className="mx-auto max-w-5xl space-y-8 px-6 py-10"><section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-semibold tracking-[.18em] text-hgnBlue">Search</p><h1 className="mt-3 font-serif text-4xl font-bold">Search Haida Gwaii News</h1><form action="/search" className="mt-6 flex gap-3"><input name="q" defaultValue={q} placeholder="Stories, events, writers, archives..." className="min-w-0 flex-1 rounded-2xl border px-4 py-3"/><button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Search</button></form></section>{q&&groups.length===0&&<p className="rounded-2xl border bg-white p-6 text-slate-600">No results found.</p>}{groups.map(g=><section key={g.title}><h2 className="border-b-4 border-double border-stone-800 pb-2 font-serif text-2xl font-bold">{g.title}</h2><div className="mt-3 space-y-3">{g.items.map((item:any,i:number)=><Link key={item.id||`${g.title}-${i}`} href={item.href} className="block rounded-2xl border bg-white p-5 hover:border-hgnBlue"><h3 className="text-xl font-black">{item.title}</h3>{item.summary&&<p className="mt-2 text-sm text-slate-600">{item.summary}</p>}</Link>)}</div></section>)}</main>}
