import Link from "next/link";
import { getGoLiveCommandSnapshot, goLiveTone } from "@/lib/go-live-command";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackChecks: Row[] = [
  {
    check_title: "Run one clean production build",
    check_group: "deployment",
    status: "review",
    severity: "critical",
    notes: "Run npm install, npm run build, then fix only true blockers before uploading.",
  },
  {
    check_title: "Apply SQL through v135 in order",
    check_group: "database",
    status: "review",
    severity: "critical",
    notes: "Confirm the latest v135 migration has run after v134 and no old SQL file is being pasted by mistake.",
  },
  {
    check_title: "Publish one real story end to end",
    check_group: "newsroom",
    status: "review",
    severity: "critical",
    notes: "Create, edit, add image metadata, publish, place on homepage, then read it on a phone.",
  },
];

function labelFor(row: Row) {
  return row.check_title || row.route_label || row.item_title || row.note_title || "Go-live item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before the online beta upload.";
}

function GoLiveCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${goLiveTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{labelFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.check_group || row.route_path || row.item_group || "go-live"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function GoLiveCommandPage() {
  const snapshot = await getGoLiveCommandSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackChecks;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v135</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Go-Live Command</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A final upload command layer for the two-person admin/editor beta: build, SQL, environment, route smoke tests, mobile check, one real story, and rollback notes.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Upload confidence</p>
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
        <Link href="/go-live-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Go-live status</p>
        </Link>
        <Link href="/admin" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Back to admin</p>
          <p className="mt-2 text-2xl font-black">Admin home</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Go-live checks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((row, index) => <GoLiveCard key={row.id || labelFor(row) || index} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Environment</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.env.map((row, index) => <GoLiveCard key={row.id || row.check_title || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Route smoke tests</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routes.map((row, index) => <GoLiveCard key={row.id || row.route_path || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Handoff notes</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.handoff.map((row, index) => <GoLiveCard key={row.id || row.note_title || index} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
