import Link from "next/link";
import { getHomepageControlSnapshot, homepageControlTone, homepageControlToneClasses, isHomepageSlotStale } from "@/lib/homepage-control";

export const dynamic = "force-dynamic";

export default async function HomepageStatusPage() {
  const snapshot = await getHomepageControlSnapshot();
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="border-b pb-6">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Homepage Status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">What is on the front page?</h1>
      <p className="mt-3 max-w-3xl text-slate-700">A simple internal-facing view of homepage freshness for the HGN admin/editor beta workflow.</p>
      <div className="mt-4"><Link href="/admin/homepage-control" className="hgn-btn-primary">Manage homepage</Link></div>
    </div>

    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</div><div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}%</div><p className="mt-2 text-sm text-slate-600">Based on visible slots, empty slots, stale stories, and open high-priority homepage checks.</p></section>

    <section className="mt-8 grid gap-4">{snapshot.visibleSlots.length ? snapshot.visibleSlots.map((slot) => { const stale = isHomepageSlotStale(slot); const tone = stale ? "bad" : homepageControlTone(slot.status); return <article key={slot.id} className={`rounded-2xl border p-5 ${homepageControlToneClasses(tone)}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Slot {slot.slot_order} · {slot.status}{stale ? " · stale" : ""}</div><h2 className="mt-1 text-2xl font-black">{slot.slot_label}</h2><p className="mt-2 text-sm opacity-80">{[slot.story_title, slot.article_slug].filter(Boolean).join(" · ") || "No story assigned"}</p>{slot.notes && <p className="mt-2 text-sm opacity-80">{slot.notes}</p>}</article>; }) : <div className="rounded-xl border border-dashed bg-slate-50 p-5 text-slate-600">No visible homepage slots yet.</div>}</section>
  </main>;
}
