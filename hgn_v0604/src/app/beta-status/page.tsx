import Link from "next/link";
import { getBetaOpsSnapshot, statusTone, toneClasses } from "@/lib/beta-ops";

export const dynamic = "force-dynamic";

export default async function BetaStatusPage() {
  const snapshot = await getBetaOpsSnapshot();
  const goTone = snapshot.openIncidents === 0 && snapshot.blockers === 0 && snapshot.readiness >= 80 ? "good" : snapshot.openIncidents > 0 || snapshot.blockers > 0 ? "bad" : "warn";
  const goLabel = goTone === "good" ? "Beta is stable" : goTone === "bad" ? "Beta has active blockers" : "Beta is getting close";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className={`rounded-3xl border p-8 shadow-sm ${toneClasses(goTone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN Beta Status</p>
        <h1 className="mt-2 text-5xl font-black">{goLabel}</h1>
        <p className="mt-3 max-w-3xl text-lg font-semibold opacity-80">Readiness is {snapshot.readiness}%. There are {snapshot.openIncidents} open incidents, {snapshot.blockers} launch blockers and {snapshot.openFeedback} open feedback reports.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/beta-feedback" className="hgn-btn-primary">Send beta feedback</Link>
          <Link href="/" className="hgn-btn-dark">Back to HGN</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Current site checks</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.siteChecks.map((check) => (
              <div key={check.id} className={`rounded-xl border p-4 ${toneClasses(statusTone(check.status))}`}>
                <div className="text-xs font-black uppercase tracking-wide opacity-70">{check.area || "Site"} · {check.status || "yellow"}</div>
                <div className="font-black">{check.label}</div>
              </div>
            ))}
            {!snapshot.siteChecks.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Site checks have not been published yet.</p>}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Known issues</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.incidents.filter((incident) => ["open", "monitoring"].includes(String(incident.status || "").toLowerCase())).map((incident) => (
              <article key={incident.id} className={`rounded-xl border p-4 ${toneClasses(statusTone(incident.status))}`}>
                <div className="text-xs font-black uppercase tracking-wide opacity-70">{incident.area || "General"} · {incident.status || "open"}</div>
                <h3 className="mt-1 font-black">{incident.title}</h3>
                {incident.summary && <p className="mt-1 text-sm font-semibold opacity-80">{incident.summary}</p>}
              </article>
            ))}
            {!snapshot.incidents.filter((incident) => ["open", "monitoring"].includes(String(incident.status || "").toLowerCase())).length && <p className="rounded-xl bg-green-50 p-4 font-bold text-green-800">No active known issues posted.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Latest beta notes</h2>
        <div className="mt-5 grid gap-3">
          {snapshot.releaseNotes.filter((note) => ["published", "public"].includes(String(note.status || "").toLowerCase()) && ["beta-readers", "public"].includes(String(note.audience || "").toLowerCase())).map((note) => (
            <article key={note.id} className="rounded-xl border bg-white p-4">
              <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{note.version || "Beta"}</div>
              <h3 className="mt-1 font-black text-slate-950">{note.title}</h3>
              {note.summary && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{note.summary}</p>}
            </article>
          ))}
          {!snapshot.releaseNotes.filter((note) => ["published", "public"].includes(String(note.status || "").toLowerCase()) && ["beta-readers", "public"].includes(String(note.audience || "").toLowerCase())).length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No reader-facing beta notes yet.</p>}
        </div>
      </section>
    </main>
  );
}
