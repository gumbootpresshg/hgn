import Link from "next/link";
import { getLaunchFixPackSnapshot, launchFixTone } from "@/lib/launch-fix-pack";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackItems: Row[] = [
  {
    item_title: "Run the defensive v136 SQL patch first",
    item_group: "database",
    status: "ready",
    severity: "critical",
    notes: "Use the defensive migration if v136 partially failed. It adds missing columns before inserts.",
  },
  {
    item_title: "Install this v137 fix pack after v136 is clean",
    item_group: "release",
    status: "review",
    severity: "high",
    notes: "This version tracks SQL guards, public route checks, and final beta launch fixes in one place.",
  },
  {
    item_title: "Do one full admin/editor publishing pass",
    item_group: "newsroom",
    status: "review",
    severity: "high",
    notes: "Create or edit one real story, check media metadata, homepage placement, mobile view, and public route loading.",
  },
];

function labelFor(row: Row) {
  return row.item_title || row.guard_title || row.route_label || row.note_title || "Launch fix item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review this before the online beta upload.";
}

function FixCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${launchFixTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{labelFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.item_group || row.guard_group || row.route_path || "launch fix"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function LaunchFixPackPage() {
  const snapshot = await getLaunchFixPackSnapshot();
  const fixes = snapshot.fixes.length ? snapshot.fixes : fallbackItems;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v137</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Launch Fix Pack</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A defensive soft-beta repair pass for the two-person admin/editor workflow: SQL guards, route checks, and the final fixes that keep the online upload calm.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Fix confidence</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.recommendation}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
          <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
        </div>
        <Link href="/launch-fix-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Fix status</p>
        </Link>
        <Link href="/admin/soft-beta-deployment" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Back to deployment</p>
          <p className="mt-2 text-2xl font-black">Deployment suite</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Fix pack</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fixes.map((row, index) => (
            <FixCard key={row.id || labelFor(row) || index} row={row} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">SQL guards</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.sqlGuards.map((row, index) => (
              <FixCard key={row.id || labelFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Route checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routeChecks.map((row, index) => (
              <FixCard key={row.id || labelFor(row) || index} row={row} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
