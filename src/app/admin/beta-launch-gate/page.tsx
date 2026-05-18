import Link from "next/link";
import { betaLaunchGateTone, getBetaLaunchGateSnapshot } from "@/lib/beta-launch-gate";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackGates: Row[] = [
  {
    title: "Homepage and article pages are ready for strangers",
    area: "public polish",
    status: "review",
    severity: "critical",
    notes: "Do not launch until the public front page and one real article feel credible on mobile.",
  },
  {
    title: "Production upload path is understood",
    area: "deployment",
    status: "review",
    severity: "critical",
    notes: "Confirm environment variables, Supabase URL/key, storage, domain and rollback notes before upload.",
  },
  {
    title: "Admin/editor daily route is simple enough",
    area: "workflow",
    status: "review",
    severity: "high",
    notes: "The two-person workflow should start from one clear place instead of scattered desks.",
  },
];

function titleFor(row: Row) {
  return row.title || row.route_label || row.check_title || row.note_title || "Beta launch item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before the online beta upload.";
}

function GateCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${betaLaunchGateTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.area || row.route_group || row.check_group || "beta launch"}
      </p>
      {row.route_path ? <p className="mt-2 text-sm font-bold opacity-80">{row.route_path}</p> : null}
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function BetaLaunchGatePage() {
  const snapshot = await getBetaLaunchGateSnapshot();
  const gates = snapshot.gates.length ? snapshot.gates : fallbackGates;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v132</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Beta Launch Gate</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A final go-live gate for putting HGN online for soft beta testing with just admin/editor review: public polish, production upload confidence, and one clean daily workflow.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Launch gate score</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.goLiveRecommendation}</p>
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
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Review items</p>
          <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.reviewItems.length}</p>
        </div>
        <Link href="/beta-launch-gate-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public status</p>
          <p className="mt-2 text-2xl font-black">Open gate status</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Go-live gates</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gates.map((row, index) => <GateCard key={row.id || titleFor(row) || index} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Public routes to smoke test</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routes.map((row, index) => <GateCard key={row.id || row.route_path || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Final production checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.checks.map((row, index) => <GateCard key={row.id || row.check_title || index} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
