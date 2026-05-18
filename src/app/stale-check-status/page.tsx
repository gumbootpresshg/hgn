import Link from "next/link";
import { getStaleCheckSnapshot, staleToneClasses } from "@/lib/stale-check";

export const dynamic = "force-dynamic";

export default async function StaleCheckStatusPage() {
  const snapshot = await getStaleCheckSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className={`rounded-3xl border p-8 shadow-sm ${staleToneClasses(tone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">v115 Stale Check Status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}% fresh</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          A simple freshness read for the admin/editor beta. It shows whether the homepage, drafts, media details and utility pages need attention before the site feels current for readers.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Active</div>
            <div className="mt-1 text-3xl font-black">{snapshot.active.length}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Urgent</div>
            <div className="mt-1 text-3xl font-black">{snapshot.urgent.length}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Fixed</div>
            <div className="mt-1 text-3xl font-black">{snapshot.fixed.length}</div>
          </div>
        </div>
        <Link href="/admin/stale-check" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
          Open Stale Check
        </Link>
      </div>
    </main>
  );
}
