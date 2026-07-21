import Link from "next/link";
import { deploymentRunwayTone, getDeploymentRunwaySnapshot } from "@/lib/deployment-runway";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackSteps: Row[] = [
  {
    step_title: "Lock the soft-beta build",
    step_group: "build",
    status: "review",
    severity: "critical",
    notes: "Stop adding new features and only fix blockers before upload.",
  },
  {
    step_title: "Run the production build",
    step_group: "deployment",
    status: "review",
    severity: "critical",
    notes: "Install dependencies, build, and fix any route errors before the site goes online.",
  },
  {
    step_title: "Publish one beta story end to end",
    step_group: "workflow",
    status: "review",
    severity: "high",
    notes: "Confirm the admin/editor flow works for a real story, not just seed data.",
  },
];

function labelFor(row: Row) {
  return row.step_title || row.check_title || row.note_title || "Deployment runway item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before the online beta upload.";
}

function RunwayCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${deploymentRunwayTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{labelFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.step_group || row.check_group || "deployment runway"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function DeploymentRunwayPage() {
  const snapshot = await getDeploymentRunwaySnapshot();
  const steps = snapshot.steps.length ? snapshot.steps : fallbackSteps;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v133</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Deployment Runway</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A practical upload-readiness board for the two-person admin/editor beta: freeze the build, confirm production settings, smoke test public pages, publish one story, and keep rollback notes ready.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Upload score</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.uploadRecommendation}</p>
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
        <Link href="/deployment-runway-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe status</p>
          <p className="mt-2 text-2xl font-black">Open runway status</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Upload sequence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((row, index) => <RunwayCard key={row.id || labelFor(row) || index} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Production checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.checks.map((row, index) => <RunwayCard key={row.id || row.check_title || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Cutover notes</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.notes.map((row, index) => <RunwayCard key={row.id || row.note_title || index} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
