import Link from "next/link";
import { getReleaseCandidateSnapshot, releaseCandidateTone } from "@/lib/release-candidate";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function CheckCard({ check }: { check: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${releaseCandidateTone(check.check_status, check.check_group)}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{check.check_group}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm">{check.check_status}</span>
      </div>
      <h3 className="mt-3 text-xl font-black">{check.title}</h3>
      {check.description ? <p className="mt-2 text-sm leading-6 opacity-80">{check.description}</p> : null}
      {check.owner_label ? <p className="mt-3 text-xs font-black uppercase tracking-widest opacity-60">Owner: {check.owner_label}</p> : null}
    </article>
  );
}

function RouteCard({ route }: { route: Row }) {
  return (
    <Link href={route.href || "/admin"} className={`rounded-2xl border p-5 shadow-sm transition hover:border-hgnBlue ${releaseCandidateTone(route.route_status, route.route_group)}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{route.route_group}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm">{route.route_status}</span>
      </div>
      <h3 className="mt-3 text-lg font-black">{route.title}</h3>
      {route.description ? <p className="mt-2 text-sm leading-6 opacity-80">{route.description}</p> : null}
    </Link>
  );
}

export default async function ReleaseCandidatePage() {
  const snapshot = await getReleaseCandidateSnapshot();
  const stats = [
    ["RC score", `${snapshot.score}%`, "How close the admin/editor workflow is to a soft beta release candidate"],
    ["Review items", snapshot.reviewChecks.length, "Checks that still need a pass"],
    ["Primary routes", snapshot.primaryRoutes.length, "Screens to keep in the daily path"],
    ["Occasional routes", snapshot.occasionalRoutes.length, "Useful tools that should not distract every day"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v125 Release Candidate Desk</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Release Candidate Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A final consolidation pass for the two-person admin/editor beta. Use this to decide whether HGN is ready to stop adding features and start testing the real daily publishing path.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="hgn-btn-dark">Admin Home</Link>
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/release-candidate-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
            <div className="mt-2 text-4xl font-black text-hgnNavy">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {snapshot.checks.map((check) => <CheckCard key={check.id || check.title} check={check} />)}
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Daily path</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.primaryRoutes.map((route) => <RouteCard key={route.id || route.href} route={route} />)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Occasional tools</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.occasionalRoutes.map((route) => <RouteCard key={route.id || route.href} route={route} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
