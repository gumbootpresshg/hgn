import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { emergencyTone, emergencyToneClasses, getEmergencyDeskSnapshot } from "@/lib/emergency-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createUpdate(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("emergency_updates").insert({
    title,
    update_type: String(formData.get("update_type") || "community"),
    severity: String(formData.get("severity") || "watch"),
    status: String(formData.get("status") || "draft"),
    location: String(formData.get("location") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    official_source: String(formData.get("official_source") || "").trim() || null,
    official_url: String(formData.get("official_url") || "").trim() || null,
    instructions: String(formData.get("instructions") || "").trim() || null,
    verified_by: String(formData.get("verified_by") || "").trim() || null,
    published_at: String(formData.get("status") || "") === "published" ? new Date().toISOString() : null,
  });
}

async function createContact(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("emergency_contacts").insert({
    name,
    organization: String(formData.get("organization") || "").trim() || null,
    role: String(formData.get("role") || "").trim() || null,
    contact_type: String(formData.get("contact_type") || "official"),
    status: String(formData.get("status") || "active"),
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createChecklistItem(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("emergency_checklist_items").insert({
    title,
    phase: String(formData.get("phase") || "prep"),
    status: String(formData.get("status") || "todo"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["emergency_updates", "emergency_contacts", "emergency_checklist_items"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "emergency_updates" && ["published", "active"].includes(status)) patch.published_at = new Date().toISOString();
  if (table === "emergency_checklist_items" && ["done", "complete"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function EmergencyDeskPage() {
  const snapshot = await getEmergencyDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Emergency readiness", `${snapshot.score}%`, "Official contacts, checklists, verified updates", signal],
    ["Active updates", snapshot.activeUpdates, "Published public safety items", snapshot.activeUpdates ? "bad" : "good"],
    ["Urgent items", snapshot.urgentUpdates, "Warnings or alerts needing attention", snapshot.urgentUpdates ? "bad" : "good"],
    ["Open checklist", snapshot.openChecklist, "Prep tasks still unfinished", snapshot.openChecklist ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v75 Emergency Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Public Safety Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Prepare HGN for storms, ferry disruptions, outages and urgent community updates with source contacts, checklists and controlled public publishing.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/emergency-updates" className="hgn-btn-primary">Public updates</Link><Link href="/emergency" className="hgn-btn-dark">Emergency page</Link><Link href="/admin/alerts" className="hgn-btn-dark">Alert bar</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${emergencyToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Emergency updates</h2><div className="mt-5 grid gap-3">{snapshot.updates.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${emergencyToneClasses(emergencyTone(item.status, item.severity))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.update_type} · {item.severity} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.location && <p className="mt-1 text-sm font-semibold opacity-80">Location: {item.location}</p>}{item.summary && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.summary}</p>}{item.instructions && <p className="mt-2 text-sm font-semibold opacity-80">Instructions: {item.instructions}</p>}{item.official_source && <p className="mt-2 text-sm opacity-80">Source: {item.official_source}</p>}<StatusButtons table="emergency_updates" id={item.id} values={["draft", "needs_verification", "published", "resolved", "expired"]} /></article>)}{!snapshot.updates.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No emergency updates yet.</p>}</div></div>
      <aside className="grid content-start gap-6">
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Create emergency update</h2><form action={createUpdate} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<select name="update_type" defaultValue="community"><option>community</option><option>weather</option><option>ferry</option><option>power</option><option>road</option><option>tsunami</option></select></label><label>Severity<select name="severity" defaultValue="watch"><option>watch</option><option>advisory</option><option>warning</option><option>alert</option><option>critical</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>needs_verification</option><option>published</option></select></label></div><label>Location<input name="location" /></label><label>Summary<textarea name="summary" rows={3} /></label><label>Instructions<textarea name="instructions" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Official source<input name="official_source" /></label><label>Official URL<input name="official_url" /></label></div><label>Verified by<input name="verified_by" /></label><button className="hgn-btn-primary">Save update</button></form></div>
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add checklist item</h2><form action={createChecklistItem} className="mt-5 grid gap-3"><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Phase<select name="phase" defaultValue="prep"><option>prep</option><option>verification</option><option>publish</option><option>followup</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>pending</option><option>done</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save task</button></form></div>
      </aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Official contacts</h2><div className="mt-5 grid gap-3">{snapshot.contacts.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${emergencyToneClasses(emergencyTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.contact_type} · {item.status}</div><h3 className="mt-1 font-black">{item.name}</h3>{item.organization && <p className="mt-1 text-sm font-semibold opacity-80">{item.organization}</p>}{item.role && <p className="mt-1 text-sm opacity-80">{item.role}</p>}{item.website && <p className="mt-1 text-sm opacity-80">{item.website}</p>}<StatusButtons table="emergency_contacts" id={item.id} values={["active", "verified", "stale"]} /></article>)}</div><form action={createContact} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add contact</h3><label>Name<input name="name" required /></label><label>Organization<input name="organization" /></label><label>Role<input name="role" /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="contact_type" defaultValue="official" /></label><label>Status<input name="status" defaultValue="active" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Phone<input name="phone" /></label><label>Email<input name="email" /></label></div><label>Website<input name="website" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save contact</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Readiness checklist</h2><div className="mt-5 grid gap-3">{snapshot.checklist.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${emergencyToneClasses(emergencyTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.phase} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="emergency_checklist_items" id={item.id} values={["todo", "pending", "done"]} /></article>)}</div></div>
    </section>
  </main>;
}
