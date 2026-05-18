import Link from "next/link";
import { getHandoffSnapshot, handoffTone, handoffToneClasses } from "@/lib/newsroom-handoff";

export const dynamic = "force-dynamic";

export default async function HandoffStatusPage() {
  const snapshot = await getHandoffSnapshot();
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="rounded-3xl bg-hgnNavy p-8 text-white">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN newsroom status</p>
      <h1 className="mt-2 text-4xl font-black">Admin/editor handoff</h1>
      <p className="mt-3 max-w-2xl text-white/75">A simple internal-style snapshot for the two-person beta workflow.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/admin/handoff" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-hgnNavy">Open Handoff Desk</Link><Link href="/admin/newsroom" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white">Newsroom</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className={`rounded-2xl border p-5 ${handoffToneClasses(snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad")}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Ready score</div><div className="mt-2 text-4xl font-black">{snapshot.score}%</div></div>
      <div className={`rounded-2xl border p-5 ${handoffToneClasses(snapshot.needsReply.length ? "bad" : "good")}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Needs reply</div><div className="mt-2 text-4xl font-black">{snapshot.needsReply.length}</div></div>
      <div className="rounded-2xl border bg-white p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open priorities</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openPriorities.length}</div></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Top priorities</h2><div className="mt-4 grid gap-3">{snapshot.openPriorities.slice(0, 5).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${handoffToneClasses(handoffTone(item.status, false, item.rank))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">#{item.rank} · {item.status}</div><h3 className="font-black">{item.priority_label}</h3>{item.target_slot && <p className="mt-1 text-sm opacity-75">{item.target_slot}</p>}</article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Open notes</h2><div className="mt-4 grid gap-3">{snapshot.openNotes.slice(0, 5).map((note) => <article key={note.id} className={`rounded-xl border p-4 ${handoffToneClasses(handoffTone(note.status, note.needs_reply))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{note.handoff_type} · {note.status}</div><h3 className="font-black">{note.note_title}</h3>{note.note_body && <p className="mt-1 text-sm opacity-75">{note.note_body}</p>}</article>)}</div></div>
    </section>
  </main>;
}
