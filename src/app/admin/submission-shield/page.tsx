import {
  getSubmissionShieldBlockers,
  getSubmissionShieldNextActions,
  submissionShieldItems,
  submissionShieldScore,
} from '@/lib/submission-shield';

export default function SubmissionShieldPage() {
  const blockers = getSubmissionShieldBlockers();
  const nextActions = getSubmissionShieldNextActions();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">v145 Submission Shield</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Submission shield</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A focused hardening pass for Letters to the Editor, public form safety, admin/editor privacy, and alert reliability before online beta.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Shield score</p>
            <p className="mt-2 text-5xl font-black">{submissionShieldScore}%</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Blockers</p>
            <p className="mt-2 text-4xl font-black text-slate-950">{blockers.length}</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Next actions</p>
            <p className="mt-2 text-4xl font-black text-slate-950">{nextActions.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {submissionShieldItems.map((item) => (
          <article key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.area}</p>
                <h2 className="mt-2 text-lg font-bold text-slate-950">{item.title}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-bold text-amber-950">Do before opening public submissions</h2>
        <ul className="mt-4 space-y-2 text-sm text-amber-900">
          {nextActions.map((item) => (
            <li key={item.title}>- {item.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
