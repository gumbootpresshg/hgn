import { securityHardeningItems, securityHardeningScore } from '@/lib/security-hardening';

export default function SecurityHardeningStatusPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Security status</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Online beta security snapshot</h1>
        <p className="mt-3 text-slate-600">A simple readout for the admin/editor beta security pass.</p>
        <p className="mt-6 text-5xl font-black text-slate-950">{securityHardeningScore}%</p>
      </section>

      <section className="space-y-3">
        {securityHardeningItems.map((item) => (
          <article key={item.title} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-slate-950">{item.title}</h2>
              <span className="text-sm font-semibold text-slate-600">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
