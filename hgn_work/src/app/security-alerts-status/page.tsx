import Link from "next/link";
import { getSecurityAlertsSnapshot } from "@/lib/security-alerts";

export const dynamic = "force-dynamic";

export default async function SecurityAlertsStatusPage() {
  const snapshot = await getSecurityAlertsSnapshot();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Security status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Submission alerts and beta security</h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        HGN is preparing letters and other reader submissions with protected review, alert logging, spam checks, and a simple admin/editor security checklist.
      </p>
      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</p>
        <p className="mt-2 text-6xl font-black text-hgnNavy">{snapshot.score}%</p>
        <p className="mt-3 text-slate-700">{snapshot.recommendation}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/submit-letter" className="hgn-btn-primary">Send a letter</Link>
        <Link href="/admin/security-alerts" className="hgn-btn-secondary">Admin security desk</Link>
      </div>
    </main>
  );
}
