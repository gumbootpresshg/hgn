import Link from "next/link";
import { getOnlineBetaHardeningSnapshot, hardeningTone } from "@/lib/online-beta-hardening";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackChecks: Row[] = [
  { title: "Homepage soft beta first impression", area: "public polish", status: "review", severity: "critical", notes: "Check the homepage like a first-time reader on mobile." },
  { title: "Production environment variables", area: "deployment", status: "review", severity: "critical", notes: "Confirm live Supabase keys, site URL and metadata base URL." },
  { title: "Hide unfinished public routes", area: "cleanup", status: "review", severity: "high", notes: "Only show what feels trustworthy for soft beta." },
];

function StatusPill({ status }: { status: string }) {
  return <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>;
}

function CheckCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${hardeningTone(status, row.severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{row.title || row.route_label || row.step_title}</h3>
        <StatusPill status={status} />
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">{row.area || row.step_group || row.device_focus || "launch"}</p>
      {row.route_path ? <p className="mt-2 text-sm font-bold opacity-80">{row.route_path}</p> : null}
      {row.expected_result ? <p className="mt-2 text-sm leading-6 opacity-80">Expected: {row.expected_result}</p> : null}
      {row.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{row.notes}</p> : null}
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function OnlineBetaHardeningPage() {
  const snapshot = await getOnlineBetaHardeningSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackChecks;
  const routes = snapshot.routes;
  const steps = snapshot.steps;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v129</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Online Beta Hardening</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A bigger launch-readiness pass for getting HGN online: public polish, production checks, mobile confidence, smoke tests and rollback readiness.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Upload confidence</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Anything red should be fixed before upload.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
          <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
          <p className="mt-1 text-sm text-slate-600">Homepage, mobile, deployment and article confidence.</p>
        </div>
        <Link href="/online-beta-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public status</p>
          <p className="mt-2 text-2xl font-black">Open online beta status</p>
          <p className="mt-1 text-sm text-white/80">Simple live-readiness view.</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Hardening checks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((row) => <CheckCard key={row.id || row.title} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Live route smoke tests</h2>
          <div className="mt-4 grid gap-4">
            {routes.map((row) => <CheckCard key={row.id || row.route_path} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Rollout steps</h2>
          <div className="mt-4 grid gap-4">
            {steps.map((row) => <CheckCard key={row.id || row.step_title} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
