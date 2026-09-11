import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPolicyDeskSnapshot, policyTone, policyToneClasses } from "@/lib/policy-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createPolicyDoc(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("site_policy_documents").insert({
    title,
    slug: String(formData.get("slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim(),
    policy_type: String(formData.get("policy_type") || "general"),
    status: String(formData.get("status") || "draft"),
    owner: String(formData.get("owner") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    public_url: String(formData.get("public_url") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createReviewTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("policy_review_tasks").insert({
    title,
    policy_area: String(formData.get("policy_area") || "site policy"),
    status: String(formData.get("status") || "needs-review"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createRisk(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("legal_risk_register").insert({
    title,
    risk_area: String(formData.get("risk_area") || "publishing"),
    severity: String(formData.get("severity") || "medium"),
    priority: String(formData.get("priority") || "normal"),
    status: String(formData.get("status") || "open"),
    mitigation: String(formData.get("mitigation") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["site_policy_documents", "policy_review_tasks", "consent_compliance_checks", "legal_risk_register"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["approved", "published", "complete", "done", "ready", "resolved"].includes(status)) patch.resolved_at = new Date().toISOString();
  if (table === "site_policy_documents" && status === "published") patch.published_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function PolicyDeskPage() {
  const snapshot = await getPolicyDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Policy readiness", `${snapshot.score}%`, "Documents, consent checks and risk cleanup", signal],
    ["Published policies", snapshot.publishedDocs.length, "Public-facing docs ready", snapshot.publishedDocs.length >= 3 ? "good" : "warn"],
    ["Open review tasks", snapshot.openTasks.length, "Policy tasks still in motion", snapshot.openTasks.length ? "warn" : "good"],
    ["Open risks", snapshot.openRisks.length, "Legal/editorial risks to resolve", snapshot.openRisks.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v84 Policy Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Policy Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Get the beta launch legally and operationally tidy: public policies, consent checks, review tasks and risk register in one place.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/policies" className="hgn-btn-primary">Public policies</Link><Link href="/admin/trust" className="hgn-btn-dark">Trust desk</Link><Link href="/admin/launch-room" className="hgn-btn-dark">Launch room</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${policyToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Public policy documents</h2><div className="mt-5 grid gap-3">{snapshot.documents.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${policyToneClasses(policyTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.policy_type} · {item.status}</div><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.slug, item.owner].filter(Boolean).join(" · ") || "No owner assigned"}</p>{item.summary && <p className="mt-2 text-sm opacity-80">{item.summary}</p>}{item.public_url && <p className="mt-2 text-sm font-bold">URL: {item.public_url}</p>}<StatusButtons table="site_policy_documents" id={item.id} values={["draft", "review", "approved", "published"]} /></article>)}</div><form action={createPolicyDoc} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add policy document</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Slug<input name="slug" /></label><label>Type<input name="policy_type" defaultValue="privacy" /></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>approved</option><option>published</option></select></label></div><label>Summary<textarea name="summary" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Public URL<input name="public_url" /></label><label>Owner<input name="owner" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save policy</button></form></div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Review tasks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${policyToneClasses(policyTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.policy_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.due_date].filter(Boolean).join(" · ") || "No owner or due date"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="policy_review_tasks" id={item.id} values={["needs-review", "in-progress", "blocked", "done"]} /></article>)}</div><form action={createReviewTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add review task</h3><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Area<input name="policy_area" defaultValue="privacy" /></label><label>Owner<input name="owner" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="needs-review"><option>needs-review</option><option>in-progress</option><option>blocked</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Due date<input name="due_date" type="date" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save task</button></form></div></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Consent and compliance checks</h2><div className="mt-4 grid gap-3">{snapshot.checks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${policyToneClasses(policyTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.check_area} · {item.status}</div><h3 className="mt-1 font-black">{item.requirement}</h3><p className="mt-1 text-sm opacity-80">{item.route_path || "Site-wide"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="consent_compliance_checks" id={item.id} values={["missing", "needs-review", "ready", "complete"]} /></article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Risk register</h2><div className="mt-4 grid gap-3">{snapshot.risks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${policyToneClasses(policyTone(item.status, item.priority || item.severity))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.risk_area} · {item.severity} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.mitigation && <p className="mt-2 text-sm opacity-80">{item.mitigation}</p>}<StatusButtons table="legal_risk_register" id={item.id} values={["open", "review", "blocked", "resolved"]} /></article>)}</div><form action={createRisk} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add risk</h3><label>Risk title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="risk_area" defaultValue="publishing" /></label><label>Severity<select name="severity" defaultValue="medium"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="open"><option>open</option><option>review</option><option>blocked</option><option>resolved</option></select></label></div><label>Mitigation<textarea name="mitigation" rows={3} /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save risk</button></form></div>
    </section>
  </main>;
}
