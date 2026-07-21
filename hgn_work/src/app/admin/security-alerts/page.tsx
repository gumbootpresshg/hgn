import Link from "next/link";
import { getSecurityAlertsSnapshot, securityAlertTone } from "@/lib/security-alerts";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function Card({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${securityAlertTone(item.status, item.priority)}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-widest opacity-70">{item.check_group || item.priority || "security"}</p>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase">{item.status || "open"}</span>
      </div>
      <h2 className="mt-3 text-xl font-black">{item.check_title || item.alert_label || "Security item"}</h2>
      {item.check_body ? <p className="mt-2 text-sm leading-6 opacity-80">{item.check_body}</p> : null}
      {item.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{item.notes}</p> : null}
    </article>
  );
}

export default async function SecurityAlertsPage() {
  const snapshot = await getSecurityAlertsSnapshot();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN v143</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Security + Submission Alerts</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A practical pre-beta security desk for the two-person admin/editor workflow: protect letters, configure email or phone alerts, and verify launch hardening before opening submissions online.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Security readiness</p>
          <p className="mt-1 text-5xl font-black text-hgnNavy">{snapshot.score}%</p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-hgnNavy p-6 text-white lg:col-span-2">
          <p className="text-xs font-black uppercase tracking-widest text-white/60">Recommendation</p>
          <h2 className="mt-2 text-2xl font-black">{snapshot.recommendation}</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            For beta, start with email alerts. Phone/SMS can be added through an email-to-SMS address, Twilio, or a later webhook once the email path is stable.
          </p>
        </div>
        <Link href="/submit-letter" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-hgnBlue">Test route</p>
          <h2 className="mt-2 text-2xl font-black text-hgnNavy">Submit a test letter</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use the public form to confirm protected insert, spam guard, and alert logging.</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Security hardening checklist</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.checks.map((item) => <Card key={item.id || item.check_title} item={item} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Alert settings</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.settings.map((item) => <Card key={item.id || item.alert_key} item={{ ...item, status: item.is_enabled ? "enabled" : "disabled", priority: item.is_enabled ? "medium" : "high" }} />)}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Recent letters</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.recentLetters.length ? snapshot.recentLetters.map((letter) => (
              <article key={letter.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-hgnNavy">{letter.name || "Submitted letter"}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{letter.status || "new"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{letter.town || "No town listed"} · {letter.alert_status || "alert pending"}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{letter.letter}</p>
              </article>
            )) : <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No recent letters found yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
