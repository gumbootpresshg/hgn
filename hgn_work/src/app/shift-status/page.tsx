import Link from "next/link";
import { getShiftCenterSnapshot, shiftToneClasses } from "@/lib/shift-center";

export const dynamic = "force-dynamic";

export default async function ShiftStatusPage() {
  const snapshot = await getShiftCenterSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Shift Status</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Today’s shift snapshot</h1>
          <p className="mt-3 max-w-2xl text-slate-700">A lightweight public-safe view of whether the admin/editor workflow is clear for the day.</p>
        </div>
        <Link href="/admin/shift-center" className="hgn-btn-primary">Open Shift Center</Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-6 shadow-sm ${shiftToneClasses(tone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div>
          <div className="mt-2 text-5xl font-black">{snapshot.score}%</div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.active.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-hgnNavy">Current focus</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.active.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{item.item_type} · {item.shift_status}</div>
              <h3 className="mt-1 font-black text-hgnNavy">{item.title}</h3>
              {item.notes ? <p className="mt-2 text-sm text-slate-700">{item.notes}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
