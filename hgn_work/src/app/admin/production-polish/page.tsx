import Link from "next/link";
import { getProductionPolishSnapshot, polishTone } from "@/lib/production-polish";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function Card({ row, titleKey = "title" }: { row: Row; titleKey?: string }) {
  const status = String(row.status || "review");
  const title = row[titleKey] || row.route_label || "Polish item";

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${polishTone(status)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{title}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      {row.area ? <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">{row.area}</p> : null}
      {row.route_path ? <p className="mt-2 text-sm font-bold opacity-80">{row.route_path}</p> : null}
      {row.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{row.notes}</p> : null}
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function ProductionPolishPage() {
  const snapshot = await getProductionPolishSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : [
    { title: "Homepage first impression pass", status: "review", area: "frontend", notes: "Hero, story hierarchy, utilities and stale items should be checked before upload." },
    { title: "Mobile navigation pass", status: "review", area: "mobile", notes: "Menu, spacing and touch targets should feel clean on a phone." },
    { title: "Production environment check", status: "review", area: "deployment", notes: "Confirm live Supabase keys, site URL, redirects and metadata." },
  ];
  const routes = snapshot.routes.length ? snapshot.routes : [
    { route_label: "Homepage", route_path: "/", status: "review", notes: "Main public first impression." },
    { route_label: "Simple admin home", route_path: "/admin/simple-home", status: "review", notes: "Primary two-person workflow entry point." },
    { route_label: "Beta ready status", route_path: "/beta-ready", status: "review", notes: "Simple confidence page for online testing." },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v128</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Production Polish Sprint</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A bigger pre-upload pass for the two-person admin/editor beta: public polish, mobile confidence, production checks and fewer loose ends.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Polish score</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Clear before uploading online.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">High priority</p>
          <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.highPriority.length}</p>
          <p className="mt-1 text-sm text-slate-600">Core checks for a credible soft beta.</p>
        </div>
        <Link href="/production-polish-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public status</p>
          <p className="mt-2 text-2xl font-black">Open polish status</p>
          <p className="mt-1 text-sm text-white/80">A simple view for checking launch confidence.</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Must-review polish checks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((row) => <Card key={row.id || row.title} row={row} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Route confidence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((row) => <Card key={row.id || row.route_path} row={row} titleKey="route_label" />)}
        </div>
      </section>
    </main>
  );
}
