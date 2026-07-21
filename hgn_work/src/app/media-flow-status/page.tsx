import Link from "next/link";
import { getMediaFlowSnapshot, mediaFlowToneClasses } from "@/lib/media-flow";

export const dynamic = "force-dynamic";

export default async function MediaFlowStatusPage() {
  const snapshot = await getMediaFlowSnapshot();
  const tone = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="border-b pb-6">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Media Status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Media Flow Status</h1>
      <p className="mt-3 max-w-3xl text-slate-700">Internal snapshot for image credits, captions, alt text and homepage image crop checks.</p>
    </div>
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <div className={`rounded-2xl border p-5 shadow-sm ${mediaFlowToneClasses(tone)}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">Score</div><div className="mt-2 text-4xl font-black">{snapshot.score}%</div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Open images</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openItems.length}</div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Needs cleanup</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.missingBasics.length}</div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Open tasks</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openTasks.length}</div></div>
    </section>
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-black text-hgnNavy">What to clean up next</h2><div className="mt-4 grid gap-3">{snapshot.missingBasics.length ? snapshot.missingBasics.slice(0, 12).map((item) => <div key={item.id} className="rounded-xl border bg-amber-50 p-4 text-amber-950"><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.priority} · {item.status}</div><div className="mt-1 font-black">{item.item_title}</div><p className="mt-1 text-sm opacity-80">Missing or flagged: {item.needs_credit ? "credit " : ""}{item.needs_caption ? "caption " : ""}{item.needs_alt_text ? "alt text " : ""}{item.needs_crop_check ? "crop check" : ""}</p></div>) : <p className="text-slate-600">No media cleanup items are currently flagged.</p>}</div></section>
    <div className="mt-8"><Link href="/admin/media-flow" className="hgn-btn-primary">Open Media Flow</Link></div>
  </main>;
}
