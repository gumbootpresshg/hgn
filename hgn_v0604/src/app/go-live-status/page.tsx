import Link from "next/link";
import { getGoLiveCommandSnapshot, goLiveTone } from "@/lib/go-live-command";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function labelFor(row: Row) {
  return row.check_title || row.route_label || row.note_title || "Go-live item";
}

function StatusCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${goLiveTone(status, row.severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-black">{labelFor(row)}</h2>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-80">{row.notes || row.expected_result || row.note_body || "Being checked before online beta."}</p>
    </article>
  );
}

export default async function GoLiveStatusPage() {
  const snapshot = await getGoLiveCommandSnapshot();
  const visible = [...snapshot.checks, ...snapshot.routes, ...snapshot.env].slice(0, 12);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Online Beta</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Go-Live Status</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple public-safe view of the final checks before HGN is uploaded for soft beta testing.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-white/60">Confidence</p>
            <p className="mt-2 text-5xl font-black">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <Link href="/" className="rounded-2xl border p-5 transition hover:border-hgnBlue">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Reader view</p>
            <p className="mt-2 text-2xl font-black text-hgnNavy">Back to HGN</p>
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {visible.map((row, index) => <StatusCard key={row.id || labelFor(row) || index} row={row} />)}
      </section>
    </main>
  );
}
