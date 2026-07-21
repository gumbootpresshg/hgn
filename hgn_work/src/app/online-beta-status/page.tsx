import Link from "next/link";
import { getOnlineBetaHardeningSnapshot, hardeningTone } from "@/lib/online-beta-hardening";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function MiniRow({ row }: { row: Row }) {
  const status = String(row.status || "review");
  return (
    <li className={`rounded-2xl border p-4 ${hardeningTone(status, row.severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-black">{row.title || row.route_label || row.step_title}</span>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      {row.notes || row.expected_result ? <p className="mt-2 text-sm opacity-80">{row.notes || row.expected_result}</p> : null}
    </li>
  );
}

export default async function OnlineBetaStatusPage() {
  const snapshot = await getOnlineBetaHardeningSnapshot();
  const nextItems = [...snapshot.criticalOpen, ...snapshot.todoSteps].slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN soft beta</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy lg:text-5xl">Online beta status</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple readiness view for the two-person admin/editor beta before putting the site online for real testing.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-white/60">Confidence</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-1 text-5xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Next items</p>
            <p className="mt-1 text-5xl font-black text-amber-700">{nextItems.length}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-hgnNavy">Next before upload</h2>
            <p className="mt-1 text-sm text-slate-600">Keep this list short and practical.</p>
          </div>
          <Link href="/admin/online-beta-hardening" className="hgn-btn-primary">Open admin check</Link>
        </div>
        <ul className="mt-4 grid gap-4">
          {(nextItems.length ? nextItems : snapshot.checks.slice(0, 5)).map((row) => <MiniRow key={row.id || row.title || row.step_title} row={row} />)}
        </ul>
      </section>
    </main>
  );
}
