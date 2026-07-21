import Link from "next/link";
import { getReaderReadySnapshot, readerReadyTone } from "@/lib/reader-ready";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackChecks: Row[] = [
  {
    check_title: "Homepage first impression",
    check_area: "homepage",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Confirm the first screen feels local, current, useful, and ready for a soft beta visitor.",
  },
  {
    check_title: "Mobile article readability",
    check_area: "mobile",
    status: "review",
    priority: "critical",
    owner: "Admin / Editor",
    notes: "Read one full article on a phone and check spacing, image crop, date, byline, and shareability.",
  },
];

function titleFor(row: Row) {
  return row.check_title || row.route_label || "Reader-ready item";
}

function bodyFor(row: Row) {
  return row.notes || "Review this before sharing the online beta link.";
}

function PolishCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const priority = String(row.priority || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${readerReadyTone(status, priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.check_area || row.route_path || "reader polish"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{bodyFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function ReaderReadyPage() {
  const snapshot = await getReaderReadySnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackChecks;
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v142</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Reader Ready Polish</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A visible beta-readiness pass for the parts real readers will judge first: homepage, articles, mobile layout, trust signals, and unfinished public routes.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Public readiness</p>
            <p className="mt-2 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-sm font-bold text-slate-600">{snapshot.recommendation}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/reader-ready-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Reader status</p>
        </Link>
        <Link href="/admin/brand-polish" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Brand</p>
          <p className="mt-2 text-2xl font-black">Free, Independent, Local.</p>
        </Link>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((row, index) => <PolishCard key={row.id || titleFor(row) || index} row={row} />)}
        {snapshot.routes.map((row, index) => <PolishCard key={row.id || titleFor(row) || index} row={row} />)}
      </section>
    </main>
  );
}
