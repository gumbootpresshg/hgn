import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTrainingDeskSnapshot, trainingTone, trainingToneClasses } from "@/lib/training-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createModule(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("training_modules").insert({
    title,
    module_area: String(formData.get("module_area") || "newsroom"),
    audience: String(formData.get("audience") || "contributors"),
    status: String(formData.get("status") || "draft"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    estimated_minutes: Number(formData.get("estimated_minutes") || 15),
    checklist: String(formData.get("checklist") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createOnboarding(formData: FormData) {
  "use server";
  const person_name = String(formData.get("person_name") || "").trim();
  if (!person_name) return;
  await supabase.from("staff_onboarding_runs").insert({
    person_name,
    person_contact: String(formData.get("person_contact") || "").trim() || null,
    role_name: String(formData.get("role_name") || "contributor"),
    status: String(formData.get("status") || "invited"),
    training_stage: String(formData.get("training_stage") || "orientation"),
    assigned_modules: String(formData.get("assigned_modules") || "").trim() || null,
    completed_modules: Number(formData.get("completed_modules") || 0),
    total_modules: Number(formData.get("total_modules") || 0),
    owner: String(formData.get("owner") || "").trim() || null,
    target_date: String(formData.get("target_date") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createResource(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("training_resources").insert({
    title,
    resource_type: String(formData.get("resource_type") || "guide"),
    resource_url: String(formData.get("resource_url") || "").trim() || null,
    audience: String(formData.get("audience") || "contributors"),
    status: String(formData.get("status") || "draft"),
    owner: String(formData.get("owner") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    related_module: String(formData.get("related_module") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_training_tasks").insert({
    title,
    task_area: String(formData.get("task_area") || "training"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    success_criteria: String(formData.get("success_criteria") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["training_modules", "staff_onboarding_runs", "training_resources", "beta_training_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["ready", "complete", "done", "published", "trained", "active"].includes(status)) patch.completed_at = new Date().toISOString();
  if (table === "training_modules" && status === "ready") patch.published_at = new Date().toISOString();
  if (table === "training_resources" && status === "published") patch.reviewed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function TrainingDeskPage() {
  const snapshot = await getTrainingDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Training readiness", `${snapshot.score}%`, "Modules, resources, onboarding and tasks", signal],
    ["Draft modules", snapshot.draftModules.length, "Training still being prepared", snapshot.draftModules.length ? "warn" : "good"],
    ["Active onboarding", snapshot.activeOnboarding.length, "People still moving through training", snapshot.activeOnboarding.length ? "warn" : "good"],
    ["Urgent tasks", snapshot.urgentTasks.length, "Launch training blockers", snapshot.urgentTasks.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v86 Training Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Training Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Prepare contributors, editors and beta helpers with a single onboarding hub before HGN opens the beta wider.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/training-beta" className="hgn-btn-primary">Public training page</Link><Link href="/admin/beta-testers" className="hgn-btn-dark">Beta testers</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${trainingToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Training modules</h2><div className="mt-4 grid gap-3">{snapshot.modules.length ? snapshot.modules.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${trainingToneClasses(trainingTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.module_area} · {item.audience} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.estimated_minutes ? `${item.estimated_minutes} min` : null].filter(Boolean).join(" · ") || "No owner"}</p>{item.checklist && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.checklist}</p>}<StatusButtons table="training_modules" id={item.id} values={["draft", "review", "ready", "complete"]} /></article>) : <Empty label="No training modules yet." />}</div><form action={createModule} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add module</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="module_area" defaultValue="newsroom" /></label><label>Audience<input name="audience" defaultValue="contributors" /></label><label>Minutes<input name="estimated_minutes" type="number" defaultValue="15" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>ready</option><option>complete</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Owner<input name="owner" /></label></div><label>Checklist<textarea name="checklist" rows={3} /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save module</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Onboarding runs</h2><div className="mt-4 grid gap-3">{snapshot.onboarding.length ? snapshot.onboarding.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${trainingToneClasses(trainingTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.role_name} · {item.training_stage} · {item.status}</div><h3 className="mt-1 font-black">{item.person_name}</h3><p className="mt-1 text-sm opacity-80">{[item.person_contact, item.owner, item.target_date].filter(Boolean).join(" · ") || "No contact"}</p><p className="mt-1 text-sm opacity-80">Modules: {item.completed_modules || 0}/{item.total_modules || 0}</p>{item.assigned_modules && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.assigned_modules}</p>}<StatusButtons table="staff_onboarding_runs" id={item.id} values={["invited", "in-progress", "trained", "complete"]} /></article>) : <Empty label="No onboarding runs yet." />}</div><form action={createOnboarding} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Start onboarding</h3><div className="grid gap-3 md:grid-cols-2"><label>Name<input name="person_name" required /></label><label>Contact<input name="person_contact" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Role<input name="role_name" defaultValue="contributor" /></label><label>Stage<input name="training_stage" defaultValue="orientation" /></label><label>Status<select name="status" defaultValue="invited"><option>invited</option><option>in-progress</option><option>trained</option><option>complete</option></select></label></div><div className="grid gap-3 md:grid-cols-4"><label>Completed<input name="completed_modules" type="number" defaultValue="0" /></label><label>Total<input name="total_modules" type="number" defaultValue="0" /></label><label>Owner<input name="owner" /></label><label>Target<input name="target_date" type="date" /></label></div><label>Assigned modules<textarea name="assigned_modules" rows={3} /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save onboarding</button></form></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Training resources</h2><div className="mt-4 grid gap-3">{snapshot.resources.length ? snapshot.resources.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${trainingToneClasses(trainingTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.resource_type} · {item.audience} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.related_module].filter(Boolean).join(" · ") || "No owner"}</p>{item.summary && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.summary}</p>}{item.resource_url && <a href={item.resource_url} className="mt-2 inline-block text-sm font-black text-hgnBlue">Open resource</a>}<StatusButtons table="training_resources" id={item.id} values={["draft", "review", "published"]} /></article>) : <Empty label="No resources yet." />}</div><form action={createResource} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add resource</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="resource_type" defaultValue="guide" /></label><label>Audience<input name="audience" defaultValue="contributors" /></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>published</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Owner<input name="owner" /></label><label>Related module<input name="related_module" /></label></div><label>URL<input name="resource_url" /></label><label>Summary<textarea name="summary" rows={3} /></label><button className="hgn-btn-primary">Save resource</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Beta training tasks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.length ? snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${trainingToneClasses(trainingTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.task_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.due_date].filter(Boolean).join(" · ") || "No owner or due date"}</p>{item.success_criteria && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.success_criteria}</p>}<StatusButtons table="beta_training_tasks" id={item.id} values={["todo", "in-progress", "blocked", "done"]} /></article>) : <Empty label="No training tasks yet." />}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="task_area" defaultValue="training" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>in-progress</option><option>blocked</option><option>done</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Owner<input name="owner" /></label><label>Due date<input name="due_date" type="date" /></label></div><label>Success criteria<textarea name="success_criteria" rows={3} /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save task</button></form></div>
    </section>
  </main>;
}
