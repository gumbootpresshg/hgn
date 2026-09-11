import Link from "next/link";
import { getSoftLaunchSnapshot, softLaunchTone } from "@/lib/soft-launch";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackRows: Row[] = [
  {
    title: "Homepage first impression",
    area: "public polish",
    status: "review",
    severity: "critical",
    notes: "Open the homepage on mobile and desktop and confirm it feels current, local and trustworthy.",
  },
  {
    title: "Production environment ready",
    area: "deployment",
    status: "review",
    severity: "critical",
    notes: "Confirm Supabase keys, site URL, metadata base URL and deployment settings before upload.",
  },
  {
    title: "Article page final pass",
    area: "publishing",
    status: "review",
    severity: "high",
    notes: "Check headline, image, caption, credit, SEO title, description and mobile readability.",
  },
];

function StatusPill({ status }: { status: string }) {
  return <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>;
}

function ReviewCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${softLaunchTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{row.title || row.route_label || row.step_title || row.item_title}</h3>
        <StatusPill status={status} />
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.area || row.route_group || row.step_group || "soft launch"}
      </p>
      {row.route_path ? <p className="mt-2 text-sm font-bold opacity-80">{row.route_path}</p> : null}
      {row.expected_result ? <p className="mt-2 text-sm leading-6 opacity-80">Expected: {row.expected_result}</p> : null}
      {row.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{row.notes}</p> : null}
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function SoftLaunchPage() {
  const snapshot = await getSoftLaunchSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackRows;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v130</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Soft Launch Prep Suite</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A consolidated final-prep view for putting HGN online: public polish, homepage confidence, article QA, mobile checks and deployment readiness.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Launch readiness</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
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
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Watch items</p>
          <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.watchItems.length}</p>
        </div>
        <Link href="/soft-launch-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public status</p>
          <p className="mt-2 text-2xl font-black">Open status view</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Final soft-launch checks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((row) => <ReviewCard key={row.id || row.title || row.route_path} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Route checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routes.map((row) => <ReviewCard key={row.id || row.route_path} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Polish items</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.polish.map((row) => <ReviewCard key={row.id || row.item_title} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Deployment steps</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.deploy.map((row) => <ReviewCard key={row.id || row.step_title} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
