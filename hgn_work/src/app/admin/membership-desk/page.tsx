import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMembershipSnapshot, membershipTone, membershipToneClasses } from "@/lib/membership-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createPlan(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const slug = String(formData.get("slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  await supabase.from("member_plans").insert({
    title,
    slug,
    status: String(formData.get("status") || "draft"),
    price_cad: Number(formData.get("price_cad") || 0) || null,
    billing_period: String(formData.get("billing_period") || "monthly"),
    audience: String(formData.get("audience") || "reader"),
    summary: String(formData.get("summary") || "").trim() || null,
    benefits: String(formData.get("benefits") || "").trim() || null,
    is_public: formData.get("is_public") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function createProspect(formData: FormData) {
  "use server";
  const full_name = String(formData.get("full_name") || "").trim();
  if (!full_name) return;
  await supabase.from("member_prospects").insert({
    full_name,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    source: String(formData.get("source") || "manual"),
    status: String(formData.get("status") || "interested"),
    priority: String(formData.get("priority") || "normal"),
    plan_interest: String(formData.get("plan_interest") || "").trim() || null,
    community: String(formData.get("community") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    next_step: String(formData.get("next_step") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("membership_tasks").insert({
    title,
    area: String(formData.get("area") || "launch"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_at: String(formData.get("due_at") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createBenefit(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("member_benefits").insert({
    title,
    status: String(formData.get("status") || "planned"),
    benefit_type: String(formData.get("benefit_type") || "access"),
    owner: String(formData.get("owner") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    launch_required: formData.get("launch_required") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["member_plans", "member_prospects", "member_benefits", "membership_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "membership_tasks" && ["done", "complete", "completed", "ready"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function MembershipDeskPage() {
  const snapshot = await getMembershipSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Membership readiness", `${snapshot.score}%`, "Plans, benefits, payment path and supporter follow-up", signal],
    ["Public plans", snapshot.publicPlans.length, "Plans visible for beta supporter messaging", snapshot.publicPlans.length ? "good" : "warn"],
    ["Warm supporters", snapshot.warmProspects.length, "People to invite into founding membership", snapshot.warmProspects.length ? "good" : "warn"],
    ["Blockers", snapshot.blockers.length, "Membership launch tasks needing attention", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v80 Membership Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Membership Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Prepare HGN for founding supporters: membership plans, supporter leads, benefits, payment readiness and launch tasks.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/membership-beta" className="hgn-btn-primary">Public membership beta</Link><Link href="/admin/revenue-readiness" className="hgn-btn-dark">Revenue</Link><Link href="/admin/audience-growth" className="hgn-btn-dark">Audience</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${membershipToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Supporter prospects</h2><div className="mt-5 grid gap-3">{snapshot.prospects.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${membershipToneClasses(membershipTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.source} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.full_name}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.email, item.phone, item.community].filter(Boolean).join(" · ") || "No contact saved"}</p>{item.plan_interest && <p className="mt-2 text-sm opacity-80">Interested in: {item.plan_interest}</p>}{item.next_step && <p className="mt-2 text-sm opacity-80">Next: {item.next_step}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="member_prospects" id={item.id} values={["interested", "contacted", "waitlist", "pledged", "converted", "not now"]} /></article>)}{!snapshot.prospects.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No supporter prospects yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add supporter prospect</h2><form action={createProspect} className="mt-5 grid gap-3"><label>Name<input name="full_name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Email<input name="email" type="email" /></label><label>Phone<input name="phone" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="interested"><option>interested</option><option>contacted</option><option>waitlist</option><option>pledged</option><option>converted</option><option>not now</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Source<input name="source" defaultValue="manual" /></label></div><label>Community<input name="community" placeholder="Masset, Skidegate, Port Clements..." /></label><label>Plan interest<input name="plan_interest" /></label><label>Next step<input name="next_step" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-primary">Save prospect</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Membership plans</h2><div className="mt-5 grid gap-3">{snapshot.plans.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${membershipToneClasses(membershipTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.audience} · {item.billing_period} · {item.status}{item.is_public ? " · public" : ""}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{item.price_cad ? `$${item.price_cad} CAD` : "Price TBD"}</p>{item.summary && <p className="mt-2 text-sm opacity-80">{item.summary}</p>}{item.benefits && <p className="mt-2 text-sm opacity-80">Benefits: {item.benefits}</p>}<StatusButtons table="member_plans" id={item.id} values={["draft", "review", "ready", "active", "paused"]} /></article>)}</div><form action={createPlan} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Create plan</h3><label>Title<input name="title" required /></label><label>Slug<input name="slug" /></label><div className="grid gap-3 md:grid-cols-3"><label>Price CAD<input name="price_cad" type="number" min="0" step="0.01" /></label><label>Billing<select name="billing_period" defaultValue="monthly"><option>monthly</option><option>annual</option><option>one-time</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>ready</option><option>active</option><option>paused</option></select></label></div><label>Audience<input name="audience" defaultValue="reader" /></label><label>Summary<textarea name="summary" rows={3} /></label><label>Benefits<textarea name="benefits" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Sort order<input name="sort_order" type="number" defaultValue="100" /></label><label className="flex items-center gap-2 pt-7 font-bold"><input name="is_public" type="checkbox" /> Show publicly</label></div><button className="hgn-btn-primary">Save plan</button></form></div>
      <div className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Member benefits</h2><div className="mt-5 grid gap-3">{snapshot.benefits.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${membershipToneClasses(membershipTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.benefit_type} · {item.status}{item.launch_required ? " · launch required" : ""}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.description && <p className="mt-2 text-sm opacity-80">{item.description}</p>}<StatusButtons table="member_benefits" id={item.id} values={["planned", "review", "ready", "active"]} /></article>)}</div><form action={createBenefit} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add benefit</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="benefit_type" defaultValue="access" /></label><label>Status<input name="status" defaultValue="planned" /></label><label>Owner<input name="owner" /></label></div><label>Description<textarea name="description" rows={3} /></label><label className="flex items-center gap-2 font-bold"><input name="launch_required" type="checkbox" /> Required for launch</label><button className="hgn-btn-dark">Save benefit</button></form></div><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Membership launch tasks</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${membershipToneClasses(membershipTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="membership_tasks" id={item.id} values={["doing", "blocked", "ready", "done"]} /></article>)}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="area" defaultValue="launch" /></label><label>Status<input name="status" defaultValue="todo" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Owner<input name="owner" /></label><label>Due at<input name="due_at" type="datetime-local" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save task</button></form></div></div>
    </section>
  </main>;
}
