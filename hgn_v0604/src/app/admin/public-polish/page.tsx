import Link from "next/link";
import { getPublicPolishSnapshot, publicPolishTone } from "@/lib/public-polish";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackChecks: Row[] = [
  {
    title: "Homepage first impression",
    area: "homepage",
    status: "review",
    severity: "critical",
    notes: "Open the homepage on mobile and desktop and decide if it feels like a real local publication.",
  },
  {
    title: "Article page trust pass",
    area: "articles",
    status: "review",
    severity: "high",
    notes: "Check one published article for byline, date, image credit, caption, SEO and share preview.",
  },
  {
    title: "Hide unfinished surfaces",
    area: "cleanup",
    status: "review",
    severity: "high",
    notes: "Keep the soft beta focused by hiding anything that looks experimental or empty.",
  },
];

function titleFor(row: Row) {
  return row.title || row.route_label || row.check_title || row.note_title || "Public polish item";
}

function detailFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review before the online beta upload.";
}

function PolishCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${publicPolishTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.area || row.route_group || row.check_group || "public polish"}
      </p>
      {row.route_path ? <p className="mt-2 text-sm font-bold opacity-80">{row.route_path}</p> : null}
      <p className="mt-2 text-sm leading-6 opacity-80">{detailFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function PublicPolishPage() {
  const snapshot = await getPublicPolishSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackChecks;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v131</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Public Polish Overhaul</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A launch-facing polish board for the parts beta visitors will actually judge first: homepage, article pages, mobile layout, public routes and feedback paths.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Public readiness</p>
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
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Review items</p>
          <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.reviewItems.length}</p>
        </div>
        <Link href="/public-polish-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Status</p>
          <p className="mt-2 text-2xl font-black">Open polish status</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">First things to judge before upload</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((row, index) => <PolishCard key={row.id || titleFor(row) || index} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Public route sweep</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.routes.map((row, index) => <PolishCard key={row.id || row.route_path || index} row={row} />)}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Article trust sweep</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.articleChecks.map((row, index) => <PolishCard key={row.id || row.check_title || index} row={row} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
