import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";
export const revalidate = 60;
export default async function DigitalPaper(){
 const {data}=await supabase.from("digital_editions").select("*").eq("status","published").order("issue_date",{ascending:false}).limit(40);
 return <main className="mx-auto max-w-7xl px-4 py-10"><SectionHeader eyebrow="Print edition" title="Digital Paper" description="Weekly HGN editions, PDFs and future flipbook links."/><div className="grid gap-5 md:grid-cols-3">{(data||[]).map((e:any)=><article key={e.id} className="hgn-card overflow-hidden">{e.cover_image_url&&<img src={e.cover_image_url} className="h-64 w-full object-cover" alt=""/>}<div className="p-5"><div className="text-xs font-black uppercase text-hgnBlue">{e.issue_date}</div><h2 className="mt-1 text-2xl font-black text-hgnNavy">{e.title}</h2><p className="mt-2 text-slate-600">{e.description}</p><div className="mt-4 flex gap-2">{e.pdf_url&&<a className="hgn-btn-primary" href={e.pdf_url}>Open PDF</a>}{e.flipbook_url&&<a className="hgn-btn-dark" href={e.flipbook_url}>Flipbook</a>}</div></div></article>)}{!(data||[]).length&&<div className="hgn-card p-8 text-slate-600 md:col-span-3">Digital editions will appear here after staff publish them.</div>}</div></main>
}
