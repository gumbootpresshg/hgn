import Link from "next/link";
import { getProductionPolishSnapshot, polishTone } from "@/lib/production-polish";

export const dynamic = "force-dynamic";

export default async function ProductionPolishStatusPage() {
  const snapshot = await getProductionPolishSnapshot();
  const checks = snapshot.checks.length ? snapshot.checks.slice(0, 6) : [
    { title: "Homepage first impression", status: "review", area: "frontend" },
    { title: "Mobile navigation", status: "review", area: "mobile" },
    { title: "Production environment", status: "review", area: "deployment" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Soft beta polish</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy lg:text-5xl">Production polish status</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A lightweight readiness view for the final checks before HGN goes online for admin/editor soft beta testing.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-slate-300">Current score</p>
          <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {checks.map((row) => (
          <article key={row.id || row.title} className={`rounded-2xl border p-4 shadow-sm ${polishTone(row.status)}`}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-black">{row.title}</h2>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{row.status}</span>
            </div>
            {row.area ? <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">{row.area}</p> : null}
          </article>
        ))}
      </section>

      <div className="mt-8">
        <Link href="/admin/production-polish" className="font-black text-hgnBlue hover:underline">Open admin polish sprint</Link>
      </div>
    </main>
  );
}
