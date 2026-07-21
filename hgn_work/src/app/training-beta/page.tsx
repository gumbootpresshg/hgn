import Link from "next/link";
import { getTrainingDeskSnapshot, trainingToneClasses } from "@/lib/training-desk";

export const dynamic = "force-dynamic";

export default async function TrainingBetaPage() {
  const snapshot = await getTrainingDeskSnapshot();
  const publicResources = snapshot.resources.filter((item) => ["published", "ready", "active"].includes(String(item.status || "").toLowerCase()));
  const readyModules = snapshot.modules.filter((item) => ["ready", "complete", "published"].includes(String(item.status || "").toLowerCase()));
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta training</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black">Contributor and beta helper quickstart</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">This page collects the training modules and public resources HGN needs before wider beta access. It is meant for contributors, testers, helpers and early newsroom partners.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/beta-join" className="rounded-xl bg-white px-5 py-3 font-black text-hgnNavy">Join beta</Link><Link href="/contribute" className="rounded-xl border border-white/30 px-5 py-3 font-black text-white">Contribute</Link><Link href="/request-correction" className="rounded-xl border border-white/30 px-5 py-3 font-black text-white">Request correction</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className={`rounded-2xl border p-5 ${trainingToneClasses(snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad")}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">Training readiness</div><div className="mt-2 text-4xl font-black">{snapshot.score}%</div><p className="mt-2 text-sm opacity-80">Internal readiness score for beta onboarding.</p></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Ready modules</div><div className="mt-2 text-4xl font-black text-hgnNavy">{readyModules.length}</div><p className="mt-2 text-sm text-slate-600">Modules available or close to ready.</p></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Public resources</div><div className="mt-2 text-4xl font-black text-hgnNavy">{publicResources.length}</div><p className="mt-2 text-sm text-slate-600">Guides and references prepared for readers or contributors.</p></div>
    </section>

    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-3xl font-black text-hgnNavy">Ready modules</h2><div className="mt-5 grid gap-4">{readyModules.length ? readyModules.map((item) => <article key={item.id} className="rounded-2xl border bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{item.module_area} · {item.audience}</p><h3 className="mt-2 text-xl font-black text-hgnNavy">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{item.notes || item.checklist || "Training details are being prepared."}</p></article>) : <p className="rounded-2xl border border-dashed p-5 text-slate-600">Training modules are being prepared for beta.</p>}</div></div>
      <div className="hgn-card p-6"><h2 className="text-3xl font-black text-hgnNavy">Resources</h2><div className="mt-5 grid gap-4">{publicResources.length ? publicResources.map((item) => <article key={item.id} className="rounded-2xl border bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{item.resource_type} · {item.audience}</p><h3 className="mt-2 text-xl font-black text-hgnNavy">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{item.summary || "Resource summary coming soon."}</p>{item.resource_url && <a href={item.resource_url} className="mt-3 inline-block font-black text-hgnBlue">Open resource</a>}</article>) : <p className="rounded-2xl border border-dashed p-5 text-slate-600">Public training resources will appear here when published.</p>}</div></div>
    </section>
  </main>;
}
