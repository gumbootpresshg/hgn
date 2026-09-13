import { supabase } from "@/lib/supabase"
import { SitePageRenderer } from "@/components/cms/SitePageRenderer"

export const revalidate = 30
const fallback = [
  { id:"about-1", type:"paragraph", content:"Haida Gwaii News is a community newspaper and digital news service covering the islands, people, events, businesses, sports, columns, letters, obituaries and public notices that matter to Haida Gwaii." },
  { id:"about-2", type:"paragraph", content:"Our website supports the print paper while giving readers a useful daily source for local news, community information, weather, events, archives and ways to take part." },
] as any[]
export default async function AboutPage(){ const {data}=await supabase.from('hgn_site_pages').select('*').eq('system_key','about').eq('status','published').eq('visibility','public').maybeSingle(); return <main className="mx-auto max-w-5xl px-4 py-10"><p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">{data?.eyebrow||'About Us'}</p><h1 className="mt-2 font-serif text-5xl font-bold text-hgnNavy">{data?.title||'Haida Gwaii News'}</h1>{data?.description&&<p className="mt-3 text-lg text-slate-600">{data.description}</p>}<section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm"><SitePageRenderer blocks={Array.isArray(data?.blocks)?data.blocks:fallback}/></section></main> }
