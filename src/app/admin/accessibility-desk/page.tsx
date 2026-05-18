import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { accessibilityTone, accessibilityToneClasses, getAccessibilitySnapshot } from "@/lib/accessibility-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createCheck(formData: FormData) {
  "use server";
  const requirement = String(formData.get("requirement") || "").trim();
  if (!requirement) return;
  await supabase.from("accessibility_audit_checks").insert({
    route_path: String(formData.get("route_path") || "/"),
    check_area: String(formData.get("check_area") || "general"),
    requirement,
    wcag_ref: String(formData.get("wcag_ref") || "").trim() || null,
    status: String(formData.get("status") || "needs-review"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("accessibility_remediation_tasks").insert({
    title,
    route_path: String(formData.get("route_path") || "").trim() || null,
    issue_type: String(formData.get("issue_type") || "accessibility"),
    status: String(formData.get("status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    fix_notes: String(formData.get("fix_notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["accessibility_audit_checks", "accessibility_remediation_tasks", "accessibility_reader_requests"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "accessibility_audit_checks" && ["passed", "failed", "needs-review"].includes(status)) patch.last_checked_at = new Date().toISOString();
  if (["resolved", "done", "closed", "complete"].includes(status)) patch.resolved_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function AccessibilityDeskPage() {
  const snapshot = await getAccessibilitySnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Accessibility readiness", `${snapshot.score}%`, "Audit checks, open requests and remediation tasks", signal],
    ["Passed checks", `${snapshot.passedChecks.length}/${snapshot.checks.length}`, "Checks marked passed or complete", snapshot.passedChecks.length ? "good" : "warn"],
    ["Open tasks", snapshot.openTasks.length, "Accessibility fixes still open", snapshot.openTasks.length ? "bad" : "good"],
    ["Reader requests", snapshot.openRequests.length, "Accessibility help requests awaiting response", snapshot.openRequests.length ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v82 Accessibility Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Accessibility Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Track keyboard, contrast, alt text, forms and reader accessibility requests before HGN opens to a wider beta audience.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/accessibility-status" className="hgn-btn-primary">Public status</Link><Link href="/accessibility-request" className="hgn-btn-dark">Request help</Link><Link href="/admin/mobile-qa" className="hgn-btn-dark">Mobile QA</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${accessibilityToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Audit checks</h2><div className="mt-5 grid gap-3">{snapshot.checks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${accessibilityToneClasses(accessibilityTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.route_path} · {item.check_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.requirement}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.wcag_ref, item.owner, item.last_checked_at && `checked ${new Date(item.last_checked_at).toLocaleDateString()}`].filter(Boolean).join(" · ") || "No owner assigned"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="accessibility_audit_checks" id={item.id} values={["needs-review", "testing", "passed", "failed"]} /></article>)}{!snapshot.checks.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No accessibility checks yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add audit check</h2><form action={createCheck} className="mt-5 grid gap-3"><label>Requirement<input name="requirement" required placeholder="Keyboard focus is visible on all nav links" /></label><div className="grid gap-3 md:grid-cols-2"><label>Route<input name="route_path" defaultValue="/" /></label><label>Area<input name="check_area" defaultValue="navigation" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>WCAG ref<input name="wcag_ref" placeholder="WCAG 2.4.7" /></label><label>Status<select name="status" defaultValue="needs-review"><option>needs-review</option><option>testing</option><option>passed</option><option>failed</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-primary">Save check</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Remediation tasks</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${accessibilityToneClasses(accessibilityTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.issue_type} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{item.route_path || "Site-wide"}{item.owner ? ` · ${item.owner}` : ""}{item.due_date ? ` · due ${item.due_date}` : ""}</p>{item.fix_notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.fix_notes}</p>}<StatusButtons table="accessibility_remediation_tasks" id={item.id} values={["open", "in progress", "blocked", "resolved"]} /></article>)}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Route<input name="route_path" /></label><label>Issue type<input name="issue_type" defaultValue="accessibility" /></label><label>Owner<input name="owner" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="open"><option>open</option><option>in progress</option><option>blocked</option><option>resolved</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Due date<input name="due_date" type="date" /></label></div><label>Fix notes<textarea name="fix_notes" rows={3} /></label><button className="hgn-btn-dark">Add task</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Reader requests</h2><div className="mt-5 grid gap-3">{snapshot.requests.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${accessibilityToneClasses(accessibilityTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.request_type} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.name || "Reader request"}</h3><p className="mt-1 text-sm font-semibold opacity-80">{item.route_path || "No route"}{item.email ? ` · ${item.email}` : ""}</p><p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.message}</p>{item.admin_notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">Admin: {item.admin_notes}</p>}<StatusButtons table="accessibility_reader_requests" id={item.id} values={["new", "in progress", "resolved", "closed"]} /></article>)}{!snapshot.requests.length && <p className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">No reader accessibility requests logged.</p>}</div></div>
    </section>
  </main>;
}
