import Link from "next/link";
import { getLaunchCleanupSnapshot, launchCleanupTone } from "@/lib/launch-cleanup";

export const dynamic = "force-dynamic";

export default async function LaunchCleanupStatusPage() {
  const snapshot = await getLaunchCleanupSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Launch cleanup status</p>
          <h1 className="mt-2 text-4xl font-black text-hgnNavy">What still feels messy?</h1>
          <p className="mt-3 max-w-2xl text-slate-700">A simple public/internal status view for the admin/editor cleanup push.</p>
        </div>
        <Link href="/admin/launch-cleanup" className="hgn-btn-primary">Open cleanup desk</Link>
      </div>

      <section className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Launch cleanup score</div>
        <div className="mt-2 text-6xl font-black text-hgnNavy">{snapshot.score}%</div>
        <p className="mt-3 text-slate-700">Higher means the launch path is cleaner, with fewer duplicate screens and fewer unresolved blockers.</p>
      </section>

      <section className="mt-8 grid gap-4">
        {snapshot.items.slice(0, 12).map((item) => (
          <article key={item.id} className={`rounded-2xl border p-5 ${launchCleanupTone(item.item_status)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{item.item_area} / {item.item_status}</div>
            <h2 className="mt-2 text-xl font-black">{item.title}</h2>
            {item.cleanup_note ? <p className="mt-2 text-sm leading-6 opacity-80">{item.cleanup_note}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
