import { supabase } from "@/lib/supabase";
export const revalidate = 30;
export default async function AdAnalytics(){
 const [{data:ads},{data:clicks}] = await Promise.all([supabase.from("ad_placements").select("*"), supabase.from("ad_click_events").select("ad_id,created_at")]);
 const clickCounts:Record<string,number>={}; (clicks||[]).forEach((c:any)=>{clickCounts[c.ad_id]=(clickCounts[c.ad_id]||0)+1});
 return <main className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-5xl font-black text-hgnNavy">Ad Analytics</h1><p className="mt-2 text-slate-600">Click tracking for digital placements. Impression tracking can be added later with a tiny client beacon.</p><div className="mt-8 grid gap-4">{(ads||[]).map((ad:any)=><article key={ad.id} className="hgn-card grid gap-4 p-5 md:grid-cols-[1fr_auto]"><div><div className="text-xs font-black uppercase text-hgnBlue">{ad.placement} • {ad.status}</div><h2 className="text-2xl font-black text-hgnNavy">{ad.title||ad.business_name}</h2><p className="text-sm text-slate-500">{ad.starts_at||"no start"} → {ad.ends_at||"no end"}</p></div><div className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-4xl font-black text-hgnNavy">{clickCounts[ad.id]||0}</div><div className="text-xs font-black uppercase text-slate-500">clicks</div></div></article>)}</div></main>
}
