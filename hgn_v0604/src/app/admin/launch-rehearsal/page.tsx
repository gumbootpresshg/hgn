import Link from "next/link";
import { getLaunchRehearsalSnapshot, launchRehearsalTone } from "@/lib/launch-rehearsal";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackSteps: Row[] = [
  {
    step_title: "Run the upload rehearsal once",
    step_group: "deployment",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Treat this like the real online beta upload: migration, build, homepage check, article check, mobile check, and rollback note.",
  },
  {
    step_title: "Publish one real beta story",
    step_group: "content",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Use a real article, real image, real caption, real SEO title, and real homepage placement to expose any remaining friction.",
  },
  {
    step_title: "Hide anything unfinished",
    step_group: "cleanup",
    status: "review",
    priority: "high",
    owner: "Admin",
    notes: "The soft beta should feel calm. Hide experimental routes from navigation instead of showing every internal tool.",
  },
];

function titleFor(row: Row) {
  return row.step_title || row.check_title || row.note_title || "Launch rehearsal item";
}

function bodyFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review this item before the online beta rehearsal.";
}

function RehearsalCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const priority = String(row.priority || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${launchRehearsalTone(status, priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.step_group || row.check_group || row.route_path || "launch rehearsal"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{bodyFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function LaunchRehearsalPage() {
  const snapshot = await getLaunchRehearsalSnapshot();
  const steps = snapshot.steps.length ? snapshot.steps : fallbackSteps;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v139</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Launch Rehearsal</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A bigger soft-beta step: rehearse the real upload, publish one real story end to end, check public routes, and keep the admin/editor path focused.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Rehearsal score</p>
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
        <Link href="/launch-rehearsal-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Rehearsal status</p>
        </Link>
        <Link href="/admin/production-lock" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Previous step</p>
          <p className="mt-2 text-2xl font-black">Production lock</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Rehearsal steps</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((row, index) => (
            <RehearsalCard key={row.id || titleFor(row) || index} row={row} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Public route checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routeChecks.map((row, index) => (
              <RehearsalCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Content checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.contentChecks.map((row, index) => (
              <RehearsalCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
