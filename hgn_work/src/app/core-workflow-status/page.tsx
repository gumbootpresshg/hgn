import Link from "next/link";
import { getCoreWorkflowSnapshot, coreWorkflowTone } from "@/lib/core-workflow";

export const dynamic = "force-dynamic";

export default async function CoreWorkflowStatusPage() {
  const snapshot = await getCoreWorkflowSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-blue-200">Core workflow status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}% ready</h1>
        <p className="mt-3 max-w-2xl text-blue-100">
          A compact view of whether the two-person admin/editor publishing path is simple enough for daily beta use.
        </p>
        <Link href="/admin/core-workflow" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-hgnNavy">
          Open Core Workflow
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active steps</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.activeSteps.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockedSteps.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Parked routes</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.parkedRoutes.length}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {snapshot.steps.map((step) => (
          <article key={step.id} className={`rounded-2xl border p-5 shadow-sm ${coreWorkflowTone(step.step_status)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{step.workflow_area} · {step.step_status}</div>
            <h2 className="mt-1 text-xl font-black">{step.title}</h2>
            {step.daily_rule ? <p className="mt-2 text-sm opacity-80">{step.daily_rule}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
