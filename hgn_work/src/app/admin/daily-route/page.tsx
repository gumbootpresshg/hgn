import Link from "next/link";
import { dailyRouteTone, getDailyRouteSnapshot } from "@/lib/daily-route";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function StepCard({ step, index }: { step: Row; index: number }) {
  return (
    <Link href={step.href || "/admin"} className={`rounded-2xl border p-5 shadow-sm transition hover:border-hgnBlue ${dailyRouteTone(step.step_status, step.step_group)}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black shadow-sm">{index + 1}</span>
        <span className="text-xs font-black uppercase tracking-widest opacity-70">{step.step_group}</span>
      </div>
      <h3 className="mt-4 text-xl font-black">{step.title}</h3>
      {step.description ? <p className="mt-2 text-sm leading-6 opacity-80">{step.description}</p> : null}
    </Link>
  );
}

export default async function DailyRoutePage() {
  const snapshot = await getDailyRouteSnapshot();
  const stats = [
    ["Route score", `${snapshot.score}%`, "How simple the daily path feels"],
    ["Daily steps", snapshot.daily.length, "Primary route"],
    ["Cleanup steps", snapshot.cleanup.length, "Used when trimming clutter"],
    ["Open notes", snapshot.activeNotes.length, "Admin/editor reminders"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v123 Daily Route Cleanup</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Daily Route</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A cleaner route for the two-person admin/editor beta. Start here when the admin side feels too spread out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/simple-home" className="hgn-btn-dark">Simple Home</Link>
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/daily-route-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
            <div className="mt-2 text-4xl font-black text-hgnNavy">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {snapshot.daily.map((step, index) => <StepCard key={step.id || step.title} step={step} index={index} />)}
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Cleanup route</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.cleanup.map((step, index) => <StepCard key={step.id || step.title} step={step} index={index} />)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-hgnNavy">Notes</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.activeNotes.length ? snapshot.activeNotes.map((note) => (
              <article key={note.id || note.note_title} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">{note.note_type} · {note.owner_label}</div>
                <h3 className="mt-2 font-black text-hgnNavy">{note.note_title}</h3>
                {note.note_body ? <p className="mt-1 text-sm leading-6 text-slate-700">{note.note_body}</p> : null}
              </article>
            )) : <p className="text-sm text-slate-600">No route notes yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
