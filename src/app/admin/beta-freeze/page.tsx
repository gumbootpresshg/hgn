import Link from "next/link";
import { betaFreezeTone, getBetaFreezeSnapshot } from "@/lib/beta-freeze";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function ItemCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${betaFreezeTone(item.item_status, item.item_group)}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{item.item_group}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm">{item.item_status}</span>
      </div>
      <h3 className="mt-3 text-xl font-black">{item.title}</h3>
      {item.description ? <p className="mt-2 text-sm leading-6 opacity-80">{item.description}</p> : null}
      {item.owner_label ? <p className="mt-3 text-xs font-black uppercase tracking-widest opacity-60">Owner: {item.owner_label}</p> : null}
    </article>
  );
}

function RouteCard({ route }: { route: Row }) {
  return (
    <Link href={route.href || "/admin"} className={`rounded-2xl border p-5 shadow-sm transition hover:border-hgnBlue ${betaFreezeTone(route.route_status, route.route_group)}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{route.route_group}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm">{route.route_status}</span>
      </div>
      <h3 className="mt-3 text-lg font-black">{route.title}</h3>
      {route.description ? <p className="mt-2 text-sm leading-6 opacity-80">{route.description}</p> : null}
    </Link>
  );
}

export default async function BetaFreezePage() {
  const snapshot = await getBetaFreezeSnapshot();
  const stats = [
    ["Freeze score", `${snapshot.score}%`, "How ready the two-person beta is for a feature freeze"],
    ["Blockers", snapshot.blockers.length, "Issues to clear before freezing"],
    ["Primary routes", snapshot.primaryRoutes.length, "Daily paths worth keeping visible"],
    ["Parked routes", snapshot.parkedRoutes.length, "Useful later, hidden for now"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v124 Beta Freeze Prep</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Beta Freeze Prep</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A feature-freeze checklist for the two-person admin/editor beta. Use this to stop adding surface area and focus on what must be stable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/daily-route" className="hgn-btn-dark">Daily Route</Link>
          <Link href="/admin/simple-home" className="hgn-btn-dark">Simple Home</Link>
          <Link href="/beta-freeze-status" className="hgn-btn-primary">Status</Link>
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
        {snapshot.items.map((item) => <ItemCard key={item.id || item.title} item={item} />)}
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Primary routes to keep</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.primaryRoutes.map((route) => <RouteCard key={route.id || route.title} route={route} />)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Park for later</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.parkedRoutes.map((route) => <RouteCard key={route.id || route.title} route={route} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
