import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { coreWorkflowTone, getCoreWorkflowSnapshot } from "@/lib/core-workflow";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addCoreWorkflowStep(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("core_workflow_steps").insert({
    title,
    workflow_area: String(formData.get("workflow_area") || "publishing"),
    step_status: String(formData.get("step_status") || "active"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    daily_rule: String(formData.get("daily_rule") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateCoreWorkflowStep(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("core_workflow_steps")
    .update({ step_status: String(formData.get("step_status") || "active"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function StepCard({ step }: { step: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${coreWorkflowTone(step.step_status)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{step.workflow_area}</span>
        <span>{step.step_status}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{step.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {step.owner}</p>
      {step.daily_rule ? <p className="mt-3 text-sm leading-6 opacity-80">Rule: {step.daily_rule}</p> : null}
      {step.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{step.notes}</p> : null}
      <form action={updateCoreWorkflowStep} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={step.id} />
        {["active", "next", "blocked", "parked", "done"].map((status) => (
          <button key={status} name="step_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function CoreWorkflowPage() {
  const snapshot = await getCoreWorkflowSnapshot();
  const stats = [
    ["Workflow score", `${snapshot.score}%`, "How calm the core publishing path feels"],
    ["Active steps", snapshot.activeSteps.length, "Keep this tight"],
    ["Blocked", snapshot.blockedSteps.length, "Fix before adding more"],
    ["Parked routes", snapshot.parkedRoutes.length, "Good cleanup signal"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v120 Core Workflow</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Core Workflow</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            The preferred two-person admin/editor publishing rhythm. Use this to avoid bouncing between too many desks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/admin/admin-map" className="hgn-btn-dark">Admin Map</Link>
          <Link href="/core-workflow-status" className="hgn-btn-primary">Status</Link>
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Preferred daily path</h2>
          {snapshot.steps.length ? (
            snapshot.steps.map((step) => <StepCard key={step.id} step={step} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No workflow steps yet.</div>
          )}
        </div>

        <aside className="grid gap-6">
          <form action={addCoreWorkflowStep} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add workflow step</h2>
            <input name="title" placeholder="Step title" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="workflow_area" className="rounded-xl border px-4 py-3">
                <option value="planning">Planning</option>
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="live">Live</option>
                <option value="wrap">Wrap</option>
              </select>
              <select name="step_status" className="rounded-xl border px-4 py-3">
                <option value="active">Active</option>
                <option value="next">Next</option>
                <option value="blocked">Blocked</option>
                <option value="parked">Parked</option>
              </select>
            </div>
            <input name="owner" placeholder="Admin / Editor" className="rounded-xl border px-4 py-3" />
            <textarea name="daily_rule" placeholder="When should this be used?" className="min-h-24 rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-24 rounded-xl border px-4 py-3" />
            <button type="submit" className="hgn-btn-primary">Add step</button>
          </form>

          <section className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Primary route</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.routes.map((route) => (
                <Link key={route.id} href={route.href || "/admin"} className={`rounded-xl border p-4 transition hover:border-hgnBlue ${coreWorkflowTone(route.route_status)}`}>
                  <div className="text-xs font-black uppercase tracking-widest opacity-70">{route.route_status}</div>
                  <h3 className="mt-1 font-black">{route.title}</h3>
                  {route.reason ? <p className="mt-1 text-sm opacity-80">{route.reason}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
