import Link from "next/link";
import { finalSweepTone, getOnlineBetaFinalSweepSnapshot } from "@/lib/online-beta-final-sweep";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackItems: Row[] = [
  {
    item_title: "Freeze feature work after this package",
    item_group: "feature freeze",
    status: "review",
    severity: "critical",
    notes: "Only fix blockers, copy mistakes, build errors and public launch issues after v134.",
  },
  {
    item_title: "Publish one real beta article end to end",
    item_group: "workflow",
    status: "review",
    severity: "critical",
    notes: "Create, edit, add image metadata, publish, feature on homepage and view on mobile.",
  },
  {
    item_title: "Do a phone-first homepage pass",
    item_group: "mobile",
    status: "review",
    severity: "high",
    notes: "Open the homepage from a phone and check hero story, menus, spacing, images and scroll depth.",
  },
];

function titleFor(row: Row) {
  return row.item_title || row.route_label || row.note_title || "Final sweep item";
}

function detailsFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before online beta upload.";
}

function SweepCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${finalSweepTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.item_group || row.route_path || "final sweep"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{detailsFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function OnlineBetaFinalSweepPage() {
  const snapshot = await getOnlineBetaFinalSweepSnapshot();
  const items = snapshot.items.length ? snapshot.items : fallbackItems;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v134</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Online Beta Final Sweep</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              The last practical pass before HGN goes online for soft beta: freeze features, run the build, apply SQL, publish one real story, check mobile, and smoke test the public routes.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Launch confidence</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.recommendation}</p>
          </div>
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
        <Link href="/online-beta-final-sweep-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe status</p>
          <p className="mt-2 text-2xl font-black">Open final sweep status</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Final sweep</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((row, index) => <SweepCard key={row.id || titleFor(row) || index} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Public route smoke tests</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routes.map((row, index) => <SweepCard key={row.id || row.route_path || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Final notes</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.notes.map((row, index) => <SweepCard key={row.id || row.note_title || index} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
