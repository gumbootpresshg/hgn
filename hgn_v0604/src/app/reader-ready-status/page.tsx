import { getReaderReadySnapshot, readerReadyTone } from "@/lib/reader-ready";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function titleFor(row: Row) {
  return row.route_label || row.check_title || "Reader-ready check";
}

export default async function ReaderReadyStatusPage() {
  const snapshot = await getReaderReadySnapshot();
  const items = [...snapshot.routes, ...snapshot.checks].slice(0, 12);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Soft beta readiness</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Reader-ready status</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple public-facing check on whether the site feels ready for early readers. HGN is being polished around one clear promise: {snapshot.tagline}
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-slate-300">Current readiness</p>
          <p className="mt-2 text-5xl font-black">{snapshot.score}%</p>
          <p className="mt-2 text-sm text-slate-200">{snapshot.recommendation}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const status = String(item.status || "review");
          const priority = String(item.priority || "medium");
          return (
            <article key={item.id || titleFor(item) || index} className={`rounded-2xl border p-4 shadow-sm ${readerReadyTone(status, priority)}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-black">{titleFor(item)}</h2>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">{item.notes || item.route_path || "Reader-facing polish check."}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
