import Link from "next/link";
import { getShipCheckSnapshot, shipToneClasses } from "@/lib/ship-check";

export const dynamic = "force-dynamic";

export default async function ShipCheckStatusPage() {
  const snapshot = await getShipCheckSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className={`rounded-3xl border p-8 shadow-sm ${shipToneClasses(tone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">v114 Ship Check Status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}% ready</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          This public status page gives you a quick read on whether today&apos;s homepage, publishing, media and mobile checks are clear enough to call the day shippable.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Open</div>
            <div className="mt-1 text-3xl font-black">{snapshot.open.length}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Done</div>
            <div className="mt-1 text-3xl font-black">{snapshot.done.length}</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Blockers</div>
            <div className="mt-1 text-3xl font-black">{snapshot.blockers.length}</div>
          </div>
        </div>
        <Link href="/admin/ship-check" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
          Open Ship Check
        </Link>
      </div>
    </main>
  );
}
