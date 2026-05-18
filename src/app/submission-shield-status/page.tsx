import { getSubmissionShieldBlockers, submissionShieldScore } from '@/lib/submission-shield';

export default function SubmissionShieldStatusPage() {
  const blockers = getSubmissionShieldBlockers();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Submission security status</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Letters alert and form safety</h1>
        <p className="mt-3 text-slate-600">
          Current readiness score: <strong>{submissionShieldScore}%</strong>. Keep this internal while the admin/editor beta is active.
        </p>
      </section>
      <section className="rounded-3xl border bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">Remaining blockers</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {blockers.map((item) => (
            <li key={item.title}>- {item.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
