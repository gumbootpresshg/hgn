import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getModerationDeskSnapshot, moderationTone, moderationToneClasses } from "@/lib/moderation-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createCase(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("moderation_cases").insert({
    title,
    source_type: String(formData.get("source_type") || "reader_submission"),
    source_reference: String(formData.get("source_reference") || "").trim() || null,
    submitter_name: String(formData.get("submitter_name") || "").trim() || null,
    submitter_contact: String(formData.get("submitter_contact") || "").trim() || null,
    status: String(formData.get("status") || "new"),
    priority: String(formData.get("priority") || "normal"),
    risk_level: String(formData.get("risk_level") || "low"),
    assigned_to: String(formData.get("assigned_to") || "").trim() || null,
    internal_notes: String(formData.get("internal_notes") || "").trim() || null,
    public_note: String(formData.get("public_note") || "").trim() || null,
  });
}

async function createRule(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("moderation_rules").insert({
    title,
    rule_area: String(formData.get("rule_area") || "community"),
    severity: String(formData.get("severity") || "medium"),
    status: String(formData.get("status") || "draft"),
    public_summary: String(formData.get("public_summary") || "").trim() || null,
    internal_guidance: String(formData.get("internal_guidance") || "").trim() || null,
    reviewer: String(formData.get("reviewer") || "").trim() || null,
  });
}

async function createCheck(formData: FormData) {
  "use server";
  const check_label = String(formData.get("check_label") || "").trim();
  if (!check_label) return;
  await supabase.from("moderation_checks").insert({
    case_id: String(formData.get("case_id") || "") || null,
    check_label,
    check_area: String(formData.get("check_area") || "content"),
    status: String(formData.get("status") || "pending"),
    result: String(formData.get("result") || "").trim() || null,
    checked_by: String(formData.get("checked_by") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("moderation_tasks").insert({
    title,
    task_area: String(formData.get("task_area") || "moderation"),
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
  const allowed = ["moderation_cases", "moderation_rules", "moderation_checks", "moderation_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["approved", "rejected", "resolved", "archived"].includes(status)) patch.decided_at = new Date().toISOString();
  if (["active", "reviewed", "published"].includes(status)) patch.reviewed_at = new Date().toISOString();
  if (["passed", "complete", "done"].includes(status)) patch.checked_at = new Date().toISOString();
  if (["done", "complete", "resolved"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function ModerationDeskPage() {
  const snapshot = await getModerationDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Moderation readiness", `${snapshot.score}%`, "Rules, queue, checks and launch tasks", signal],
    ["Open cases", snapshot.openCases.length, "Submissions still needing a decision", snapshot.openCases.length ? "warn" : "good"],
    ["High-risk cases", snapshot.highRiskCases.length, "Privacy, safety, legal or harassment risk", snapshot.highRiskCases.length ? "bad" : "good"],
    ["Urgent tasks", snapshot.urgentTasks.length, "Moderation blockers before wider beta", snapshot.urgentTasks.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v87 Moderation Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Moderation Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Triage reader submissions, community listings and sensitive reports before the beta opens to more people.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/community-standards" className="hgn-btn-primary">Community standards</Link><Link href="/admin/submission-desk" className="hgn-btn-dark">Submissions</Link><Link href="/admin/trust" className="hgn-btn-dark">Trust Desk</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${moderationToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Moderation queue</h2><div className="mt-4 grid gap-3">{snapshot.cases.length ? snapshot.cases.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${moderationToneClasses(moderationTone(item.status, item.priority, item.risk_level))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.source_type} · {item.status} · {item.priority} · risk {item.risk_level}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.source_reference, item.submitter_name, item.assigned_to].filter(Boolean).join(" · ") || "No owner"}</p>{item.internal_notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.internal_notes}</p>}<StatusButtons table="moderation_cases" id={item.id} values={["new", "reviewing", "escalated", "approved", "rejected", "resolved"]} /></article>) : <Empty label="No moderation cases yet." />}</div><form action={createCase} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add moderation case</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Source type<input name="source_type" defaultValue="reader_submission" /></label><label>Source/reference<input name="source_reference" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Submitter<input name="submitter_name" /></label><label>Contact<input name="submitter_contact" /></label></div><div className="grid gap-3 md:grid-cols-4"><label>Status<select name="status" defaultValue="new"><option>new</option><option>reviewing</option><option>escalated</option><option>approved</option><option>rejected</option><option>resolved</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Risk<select name="risk_level" defaultValue="low"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label><label>Assigned to<input name="assigned_to" /></label></div><label>Internal notes<textarea name="internal_notes" rows={3} /></label><label>Public note<textarea name="public_note" rows={2} /></label><button className="hgn-btn-primary">Save case</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Rules and standards</h2><div className="mt-4 grid gap-3">{snapshot.rules.length ? snapshot.rules.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${moderationToneClasses(moderationTone(item.status, item.severity))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.rule_area} · {item.severity} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.public_summary && <p className="mt-2 text-sm opacity-80">{item.public_summary}</p>}{item.internal_guidance && <p className="mt-2 whitespace-pre-wrap text-xs opacity-70">Internal: {item.internal_guidance}</p>}<StatusButtons table="moderation_rules" id={item.id} values={["draft", "review", "active", "archived"]} /></article>) : <Empty label="No moderation rules yet." />}</div><form action={createRule} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add rule</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="rule_area" defaultValue="community" /></label><label>Severity<select name="severity" defaultValue="medium"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>active</option><option>archived</option></select></label></div><label>Public summary<textarea name="public_summary" rows={3} /></label><label>Internal guidance<textarea name="internal_guidance" rows={3} /></label><label>Reviewer<input name="reviewer" /></label><button className="hgn-btn-primary">Save rule</button></form></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Review checks</h2><div className="mt-4 grid gap-3">{snapshot.checks.length ? snapshot.checks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${moderationToneClasses(moderationTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.check_area} · {item.status}</div><h3 className="mt-1 font-black">{item.check_label}</h3>{item.result && <p className="mt-2 text-sm opacity-80">{item.result}</p>}<StatusButtons table="moderation_checks" id={item.id} values={["pending", "passed", "failed", "complete"]} /></article>) : <Empty label="No moderation checks yet." />}</div><form action={createCheck} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add check</h3><label>Case ID optional<input name="case_id" /></label><div className="grid gap-3 md:grid-cols-3"><label>Check<input name="check_label" required /></label><label>Area<input name="check_area" defaultValue="content" /></label><label>Status<select name="status" defaultValue="pending"><option>pending</option><option>passed</option><option>failed</option><option>complete</option></select></label></div><label>Result<textarea name="result" rows={3} /></label><label>Checked by<input name="checked_by" /></label><button className="hgn-btn-primary">Save check</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Beta moderation tasks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.length ? snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${moderationToneClasses(moderationTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.task_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.due_date].filter(Boolean).join(" · ") || "No owner"}</p>{item.success_criteria && <p className="mt-2 text-sm opacity-80">Goal: {item.success_criteria}</p>}<StatusButtons table="moderation_tasks" id={item.id} values={["todo", "doing", "blocked", "done"]} /></article>) : <Empty label="No moderation tasks yet." />}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-4"><label>Area<input name="task_area" defaultValue="moderation" /></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>blocked</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Owner<input name="owner" /></label></div><label>Due date<input name="due_date" type="date" /></label><label>Success criteria<textarea name="success_criteria" rows={3} /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save task</button></form></div>
    </section>
  </main>;
}
