import Link from "next/link";
import { emergencyTone, emergencyToneClasses, getPublicEmergencyUpdates } from "@/lib/emergency-desk";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Emergency Updates | HGN",
  description: "Verified HGN public safety updates for Haida Gwaii during storms, ferry disruptions, outages and urgent community events.",
};

export default async function EmergencyUpdatesPage() {
  const updates = await getPublicEmergencyUpdates();
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <section className="rounded-3xl bg-hgnBlue p-8 text-white shadow-sm md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-red-100">HGN Emergency Updates</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black">Verified public safety updates for Haida Gwaii.</h1>
      <p className="mt-5 max-w-3xl text-lg text-white/85">During active incidents, HGN will use this page for confirmed local updates and links to official sources. For immediate danger, call emergency services first.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/emergency" className="rounded-xl bg-white px-5 py-3 font-black text-hgnBlue">Emergency resources</Link><Link href="/news-tips" className="rounded-xl border border-white/40 px-5 py-3 font-black text-white">Send a verified tip</Link></div>
    </section>

    <section className="mt-10 grid gap-4">{updates.map((item) => <article key={item.id} className={`rounded-2xl border p-6 shadow-sm ${emergencyToneClasses(emergencyTone(item.status, item.severity))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{item.update_type} · {item.severity}</div><h2 className="mt-2 text-3xl font-black">{item.title}</h2>{item.location && <p className="mt-1 text-sm font-bold opacity-80">Location: {item.location}</p>}{item.summary && <p className="mt-4 whitespace-pre-wrap text-base leading-7 opacity-85">{item.summary}</p>}{item.instructions && <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm font-bold opacity-90">{item.instructions}</div>}{item.official_url ? <a href={item.official_url} target="_blank" className="mt-4 inline-block font-black underline">Official source: {item.official_source || item.official_url}</a> : item.official_source && <p className="mt-4 text-sm font-bold opacity-80">Official source: {item.official_source}</p>}</article>)}{!updates.length && <div className="rounded-3xl border bg-white p-8 shadow-sm"><h2 className="text-3xl font-black text-hgnNavy">No active HGN emergency updates right now.</h2><p className="mt-3 text-slate-700">Use the emergency resources page for official provincial, ferry, outage and weather links.</p><Link href="/emergency" className="mt-5 inline-block hgn-btn-primary">Open emergency resources</Link></div>}</section>
  </main>;
}
