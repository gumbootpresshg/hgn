import Link from "next/link";
import { coreToneClasses, getBetaReadyCoreSnapshot } from "@/lib/beta-ready-core";

export const dynamic = "force-dynamic";

export default async function CoreStatusPage() {
  const snapshot = await getBetaReadyCoreSnapshot();
  const tone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Beta Status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Core Readiness</h1>
        <p className="mt-3 max-w-2xl text-slate-700">A simple internal-facing snapshot for the admin/editor beta workflow.</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-6 shadow-sm ${coreToneClasses(tone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div>
          <div className="mt-2 text-5xl font-black">{snapshot.score}%</div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open tasks</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.openCoreTasks.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-hgnNavy">Current focus</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.openCoreTasks.slice(0, 6).map((task) => (
            <div key={task.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{task.task_type} · {task.status}</div>
              <div className="mt-1 font-black text-hgnNavy">{task.task_title}</div>
            </div>
          ))}
          {snapshot.openCoreTasks.length === 0 ? <p className="text-sm text-slate-600">No open core tasks.</p> : null}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/admin/core" className="hgn-btn-primary">Open Admin Core</Link>
      </div>
    </main>
  );
}
