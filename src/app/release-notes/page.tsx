import Link from "next/link";
import { safeRows, statusTone, toneClasses } from "@/lib/beta-ops";

export const dynamic = "force-dynamic";

export default async function ReleaseNotesPage() {
  const notes = await safeRows("beta_release_notes", "published_at", 20);
  const publicNotes = notes.filter((note) => ["published", "public"].includes(String(note.status || "").toLowerCase()) && ["beta-readers", "public"].includes(String(note.audience || "").toLowerCase()));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN beta</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Release Notes</h1>
        <p className="mt-3 max-w-3xl text-slate-700">Reader-facing updates for the HGN beta: what changed, what is being tested and what to watch next.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/beta-status" className="hgn-btn-primary">Beta status</Link><Link href="/beta-feedback" className="hgn-btn-dark">Send feedback</Link></div>
      </section>
      <section className="mt-8 grid gap-4">
        {publicNotes.map((note) => (
          <article key={note.id} className={`rounded-2xl border p-6 shadow-sm ${toneClasses(statusTone(note.status))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{note.version || "Beta"} · {note.published_at ? new Date(note.published_at).toLocaleDateString("en-CA") : "Unpublished"}</div>
            <h2 className="mt-2 text-2xl font-black">{note.title}</h2>
            {note.summary && <p className="mt-3 whitespace-pre-wrap font-semibold leading-7 opacity-80">{note.summary}</p>}
          </article>
        ))}
        {!publicNotes.length && <p className="hgn-card p-6 text-slate-600">No public beta release notes have been published yet.</p>}
      </section>
    </main>
  );
}
