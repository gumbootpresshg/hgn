import Link from "next/link";
import { brandPolishTone, getBrandPolishSnapshot } from "@/lib/brand-polish";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackChecks: Row[] = [
  {
    check_title: "Header tagline updated",
    check_group: "identity",
    status: "done",
    priority: "critical",
    owner: "Admin",
    notes: "Main site tagline now reads: Free, Independent, Local.",
  },
  {
    check_title: "Public pages feel consistent",
    check_group: "presentation",
    status: "review",
    priority: "high",
    owner: "Admin / Editor",
    notes: "Check homepage, article pages, footer, and public status pages for the new beta identity.",
  },
];

function titleFor(row: Row) {
  return row.check_title || row.placement_title || row.note_title || "Brand polish item";
}

function bodyFor(row: Row) {
  return row.notes || row.expected_text || row.note_body || "Review this brand item before the online beta link is shared.";
}

function BrandCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const priority = String(row.priority || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${brandPolishTone(status, priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.check_group || row.placement_area || "brand polish"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{bodyFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function BrandPolishPage() {
  const snapshot = await getBrandPolishSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks : fallbackChecks;
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v141</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Brand Polish</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A tighter launch identity pass for the online beta. The site tagline is now short, confident, and not repetitive under the Haida Gwaii News name.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Current tagline</p>
            <p className="mt-2 text-3xl font-black">{snapshot.tagline}</p>
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.score}% brand ready</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/brand-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Brand status</p>
        </Link>
        <Link href="/admin/online-soft-beta" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Launch path</p>
          <p className="mt-2 text-2xl font-black">Online beta</p>
        </Link>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((row, index) => <BrandCard key={row.id || titleFor(row) || index} row={row} />)}
        {snapshot.placements.map((row, index) => <BrandCard key={row.id || titleFor(row) || index} row={row} />)}
      </section>
    </main>
  );
}
