import Link from "next/link";
import { deploymentTone, getSoftBetaDeploymentSnapshot } from "@/lib/soft-beta-deployment";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackSteps: Row[] = [
  {
    item_title: "Run final production build locally",
    item_group: "build",
    status: "review",
    severity: "critical",
    notes: "Install dependencies, run the production build, and fix only true launch blockers before upload.",
  },
  {
    item_title: "Apply migrations through v136",
    item_group: "database",
    status: "review",
    severity: "critical",
    notes: "Run the latest SQL after the previous migration chain and confirm the new deployment tables exist.",
  },
  {
    item_title: "Publish one real beta story end to end",
    item_group: "newsroom",
    status: "review",
    severity: "critical",
    notes: "Create, edit, add image metadata, publish, place it on the homepage, and read it on mobile.",
  },
];

function labelFor(row: Row) {
  return row.item_title || row.check_title || row.route_label || row.note_title || "Deployment item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before the online soft beta upload.";
}

function DeploymentCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${deploymentTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{labelFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.item_group || row.route_path || row.check_group || "deployment"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function SoftBetaDeploymentPage() {
  const snapshot = await getSoftBetaDeploymentSnapshot();
  const steps = snapshot.steps.length ? snapshot.steps : fallbackSteps;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v136</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Soft Beta Deployment Suite</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A final deployment control room for getting HGN online with a calm two-person admin/editor process: build, SQL, environment, smoke tests, mobile, rollback, and one real story.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Deployment confidence</p>
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
        <Link href="/soft-beta-deployment-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Deployment status</p>
        </Link>
        <Link href="/admin" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Back to admin</p>
          <p className="mt-2 text-2xl font-black">Admin home</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Deployment steps</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((row, index) => (
            <DeploymentCard key={row.id || labelFor(row) || index} row={row} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Environment</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.env.map((row, index) => (
              <DeploymentCard key={row.id || labelFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Smoke tests</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.smoke.map((row, index) => (
              <DeploymentCard key={row.id || labelFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Rollback</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.rollback.map((row, index) => (
              <DeploymentCard key={row.id || labelFor(row) || index} row={row} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
