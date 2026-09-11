import Link from "next/link";
import { getSoftLaunchSnapshot, softLaunchTone } from "@/lib/soft-launch";

export const dynamic = "force-dynamic";

function TinyRow({ title, status, notes }: { title: string; status: string; notes?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${softLaunchTone(status)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{title}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      {notes ? <p className="mt-2 text-sm leading-6 opacity-80">{notes}</p> : null}
    </div>
  );
}

export default async function SoftLaunchStatusPage() {
  const snapshot = await getSoftLaunchSnapshot();
  const openItems = [...snapshot.criticalOpen, ...snapshot.blockers, ...snapshot.watchItems].slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Soft beta readiness</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy lg:text-5xl">HGN soft launch status</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A simple status page for the admin/editor beta upload path: what is ready, what needs review and what should not block daily publishing.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-white/60">Current readiness</p>
          <p className="mt-1 text-6xl font-black">{snapshot.score}%</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
          <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
        </div>
        <Link href="/admin/soft-launch" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Admin</p>
          <p className="mt-2 text-2xl font-black">Open launch suite</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Needs attention</h2>
        <div className="mt-4 grid gap-4">
          {openItems.length ? openItems.map((row) => (
            <TinyRow key={row.id || row.title || row.route_path} title={row.title || row.route_label || row.step_title || row.item_title} status={row.status || "review"} notes={row.notes || row.expected_result} />
          )) : <TinyRow title="No major blockers listed" status="ready" notes="Keep the homepage, article pages and deployment settings under review before the online beta upload." />}
        </div>
      </section>
    </main>
  );
}
