import Link from "next/link";
import { getPublishSweepSnapshot, sweepTone, sweepToneClasses } from "@/lib/publish-sweep";

export const dynamic = "force-dynamic";

export default async function PublishSweepStatusPage() {
  const snapshot = await getPublishSweepSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN internal status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Publish Sweep Status</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple read-only view of the final checks before the next update goes live.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-5 shadow-sm ${sweepToneClasses(scoreTone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div>
          <div className="mt-2 text-4xl font-black">{snapshot.score}%</div>
          <p className="mt-2 text-sm opacity-80">Final publish sweep score.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open checks</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openItems.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {snapshot.items.length ? (
          snapshot.items.map((item) => {
            const tone = sweepTone(item.status, item.is_blocking);
            return (
              <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${sweepToneClasses(tone)}`}>
                <div className="text-xs font-black uppercase tracking-widest opacity-70">
                  {item.item_type} · {item.owner || "Admin / Editor"} · {item.status}
                </div>
                <h2 className="mt-2 text-2xl font-black">{item.item_title}</h2>
                {item.notes ? <p className="mt-2 text-sm opacity-80">{item.notes}</p> : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">No publish checks yet.</div>
        )}
      </section>

      <div className="mt-8">
        <Link href="/admin/publish-sweep" className="hgn-btn-primary">Open publish sweep</Link>
      </div>
    </main>
  );
}
