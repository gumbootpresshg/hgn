import Link from "next/link";
import { getPublicPolishSnapshot, publicPolishTone } from "@/lib/public-polish";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function labelFor(row: Row) {
  return row.title || row.route_label || row.check_title || row.note_title || "Public polish item";
}

function StatusRow({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const severity = String(row.severity || "medium");
  return (
    <article className={`rounded-2xl border p-4 ${publicPolishTone(status, severity)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{labelFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-80">{row.notes || row.expected_result || "Review before the public beta upload."}</p>
    </article>
  );
}

export default async function PublicPolishStatusPage() {
  const snapshot = await getPublicPolishSnapshot();
  const attention = [...snapshot.blockers, ...snapshot.criticalOpen, ...snapshot.reviewItems].slice(0, 10);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Online beta polish</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy lg:text-5xl">Public polish status</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A simple status view for deciding whether the public-facing site feels ready enough for the two-person admin/editor beta upload.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-white/60">Public readiness</p>
          <p className="mt-1 text-6xl font-black">{snapshot.score}%</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
          <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
        </div>
        <Link href="/admin/public-polish" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Admin</p>
          <p className="mt-2 text-2xl font-black">Open polish board</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Needs attention before upload</h2>
        <div className="mt-4 grid gap-4">
          {attention.length ? attention.map((row, index) => <StatusRow key={row.id || labelFor(row) || index} row={row} />) : <StatusRow row={{ title: "No major public polish blockers listed", status: "ready", notes: "Keep checking homepage, article pages and mobile view during the beta upload." }} />}
        </div>
      </section>
    </main>
  );
}
