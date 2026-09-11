import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSourceDeskSnapshot, sourceDeskTone, sourceDeskToneClasses } from "@/lib/source-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createContact(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("source_contacts").insert({
    name,
    source_type: String(formData.get("source_type") || "community"),
    beat: String(formData.get("beat") || "general"),
    status: String(formData.get("status") || "new"),
    contact_method: String(formData.get("contact_method") || "email"),
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    organization: String(formData.get("organization") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createPitch(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("source_story_pitches").insert({
    title,
    beat: String(formData.get("beat") || "general"),
    status: String(formData.get("status") || "new"),
    priority: String(formData.get("priority") || "normal"),
    source_name: String(formData.get("source_name") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    next_step: String(formData.get("next_step") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
  });
}

async function createCheck(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("source_verification_checks").insert({
    title,
    status: String(formData.get("status") || "pending"),
    check_type: String(formData.get("check_type") || "identity"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["source_contacts", "source_story_pitches", "source_followups", "source_verification_checks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function SourceDeskPage() {
  const snapshot = await getSourceDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Source readiness", `${snapshot.score}%`, "Contacts, pitches, followups and verification", signal],
    ["Active sources", snapshot.activeSources, "Verified or active community contacts", snapshot.activeSources ? "good" : "warn"],
    ["Urgent pitches", snapshot.urgentPitches, "Story leads needing desk attention", snapshot.urgentPitches ? "bad" : "good"],
    ["Unverified", snapshot.unverifiedChecks, "Checks still pending before publication", snapshot.unverifiedChecks ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v74 Source Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Community Source Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Track trusted local contacts, incoming story leads, verification checks and follow-ups before beta publishing ramps up.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/community-sources" className="hgn-btn-primary">Public source page</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link><Link href="/admin/trust" className="hgn-btn-dark">Trust desk</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${sourceDeskToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Story leads</h2><div className="mt-5 grid gap-3">{snapshot.pitches.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${sourceDeskToneClasses(sourceDeskTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.beat} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.source_name && <p className="mt-1 text-sm font-semibold opacity-80">Source: {item.source_name}</p>}{item.summary && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.summary}</p>}{item.next_step && <p className="mt-2 text-sm font-semibold opacity-80">Next: {item.next_step}</p>}<StatusButtons table="source_story_pitches" id={item.id} values={["new", "assigned", "needs_review", "ready", "published"]} /></article>)}{!snapshot.pitches.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No story leads yet.</p>}</div></div>
      <aside className="grid content-start gap-6">
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add source contact</h2><form action={createContact} className="mt-5 grid gap-3"><label>Name<input name="name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<select name="source_type" defaultValue="community"><option>community</option><option>official</option><option>business</option><option>sports</option><option>emergency</option><option>arts</option></select></label><label>Status<select name="status" defaultValue="new"><option>new</option><option>contacted</option><option>active</option><option>verified</option><option>stale</option></select></label></div><label>Beat<input name="beat" defaultValue="general" /></label><label>Organization<input name="organization" /></label><div className="grid gap-3 md:grid-cols-2"><label>Email<input name="email" /></label><label>Phone<input name="phone" /></label></div><label>Contact method<input name="contact_method" defaultValue="email" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save source</button></form></div>
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add story lead</h2><form action={createPitch} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Beat<input name="beat" defaultValue="general" /></label><label>Status<select name="status" defaultValue="new"><option>new</option><option>assigned</option><option>needs_review</option><option>ready</option><option>published</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Source name<input name="source_name" /></label><label>Summary<textarea name="summary" rows={3} /></label><label>Next step<input name="next_step" /></label><label>Owner<input name="owner" /></label><button className="hgn-btn-dark">Save lead</button></form></div>
      </aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Trusted contacts</h2><div className="mt-5 grid gap-3">{snapshot.contacts.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${sourceDeskToneClasses(sourceDeskTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.source_type} · {item.beat} · {item.status}</div><h3 className="mt-1 font-black">{item.name}</h3>{item.organization && <p className="mt-1 text-sm font-semibold opacity-80">{item.organization}</p>}{item.email && <p className="mt-1 text-sm opacity-80">{item.email}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="source_contacts" id={item.id} values={["contacted", "active", "verified", "stale"]} /></article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Verification checks</h2><div className="mt-5 grid gap-3">{snapshot.checks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${sourceDeskToneClasses(sourceDeskTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.check_type} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="source_verification_checks" id={item.id} values={["pending", "in_progress", "verified", "complete"]} /></article>)}</div><form action={createCheck} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Create verification check</h3><label>Check<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<select name="check_type" defaultValue="identity"><option>identity</option><option>fact</option><option>photo</option><option>quote</option><option>location</option></select></label><label>Status<select name="status" defaultValue="pending"><option>pending</option><option>in_progress</option><option>verified</option><option>complete</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save check</button></form></div>
    </section>
  </main>;
}
