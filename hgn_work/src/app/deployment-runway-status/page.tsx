import { deploymentRunwayTone, getDeploymentRunwaySnapshot } from "@/lib/deployment-runway";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function labelFor(row: Row) {
  return row.step_title || row.check_title || row.note_title || "Deployment runway item";
}

function StatusRow({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");

  return (
    <article className={`rounded-2xl border p-4 ${deploymentRunwayTone(status, severity)}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-black">{labelFor(row)}</h2>
          <p className="mt-1 text-sm opacity-75">{row.step_group || row.check_group || row.owner || "deployment runway"}</p>
        </div>
        <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      {(row.notes || row.expected_result || row.note_body) ? (
        <p className="mt-3 text-sm leading-6 opacity-80">{row.notes || row.expected_result || row.note_body}</p>
      ) : null}
    </article>
  );
}

export default async function DeploymentRunwayStatusPage() {
  const snapshot = await getDeploymentRunwaySnapshot();
  const rows = [...snapshot.steps, ...snapshot.checks, ...snapshot.notes];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Online beta</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Deployment Runway Status</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A compact view of the remaining upload steps before HGN is placed online for soft beta testing.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-white/60">Score</p>
            <p className="mt-1 text-4xl font-black">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-4 text-red-950">
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Blockers</p>
            <p className="mt-1 text-4xl font-black">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 text-orange-950">
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Critical open</p>
            <p className="mt-1 text-4xl font-black">{snapshot.criticalOpen.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Recommendation</p>
            <p className="mt-2 text-lg font-black capitalize">{snapshot.uploadRecommendation}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {rows.map((row, index) => <StatusRow key={row.id || labelFor(row) || index} row={row} />)}
      </section>
    </main>
  );
}
