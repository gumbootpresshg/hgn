import Link from "next/link";
import { getOnlineSoftBetaSnapshot, onlineSoftBetaTone } from "@/lib/online-soft-beta";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackGates: Row[] = [
  {
    gate_title: "Lock the soft-beta candidate",
    gate_group: "release",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Use this version as the online soft-beta candidate. Avoid new feature work unless it fixes a launch blocker.",
  },
  {
    gate_title: "Publish one real story after upload",
    gate_group: "content",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Confirm the real public workflow: draft, edit, media, SEO, homepage, mobile article view, and share preview.",
  },
];

function titleFor(row: Row) {
  return row.gate_title || row.check_title || row.note_title || "Online beta item";
}

function bodyFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review this item before the online soft beta opens.";
}

function BetaCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const priority = String(row.priority || "medium");

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${onlineSoftBetaTone(status, priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.gate_group || row.check_group || row.route_path || "online soft beta"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{bodyFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function OnlineSoftBetaPage() {
  const snapshot = await getOnlineSoftBetaSnapshot();
  const gates = snapshot.gates.length ? snapshot.gates : fallbackGates;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v140</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Online Soft Beta Candidate</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              Final candidate dashboard for putting HGN online in a controlled beta. Keep the scope frozen, verify the upload, and test one real publishing cycle.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Candidate score</p>
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
        <Link href="/online-soft-beta-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Beta status</p>
        </Link>
        <Link href="/admin/launch-rehearsal" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Previous step</p>
          <p className="mt-2 text-2xl font-black">Launch rehearsal</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Candidate gates</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gates.map((row, index) => (
            <BetaCard key={row.id || titleFor(row) || index} row={row} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Public route checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routeChecks.map((row, index) => (
              <BetaCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Deployment checks</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.deploymentChecks.map((row, index) => (
              <BetaCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
