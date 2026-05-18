import { getRequiredSecurityItems, securityHardeningItems, securityHardeningScore } from '@/lib/security-hardening';

export default function SecurityHardeningPage() {
  const requiredItems = getRequiredSecurityItems();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">v144 Security Hardening</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Security hardening checklist</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A focused online-beta security pass for the admin/editor workflow, protected submissions, alert logs, and production secrets.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Current hardening score</p>
          <p className="mt-2 text-5xl font-black">{securityHardeningScore}%</p>
          <p className="mt-2 text-sm text-slate-300">Treat anything marked required as a go-live blocker.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {securityHardeningItems.map((item) => (
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
        <h2 className="text-xl font-bold text-amber-950">Before online beta</h2>
        <ul className="mt-4 space-y-2 text-sm text-amber-900">
          {requiredItems.map((item) => (
            <li key={item.title}>• {item.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
