import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getHandoffSnapshot, handoffTone, handoffToneClasses } from "@/lib/newsroom-handoff";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addNote(formData: FormData) {
  "use server";
  const note_title = String(formData.get("note_title") || "").trim();
  if (!note_title) return;
  await supabase.from("newsroom_handoff_notes").insert({
    note_title,
    note_body: String(formData.get("note_body") || "").trim() || null,
    handoff_type: String(formData.get("handoff_type") || "daily"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    needs_reply: formData.get("needs_reply") === "on",
  });
}

async function addPriority(formData: FormData) {
  "use server";
  const priority_label = String(formData.get("priority_label") || "").trim();
  if (!priority_label) return;
  await supabase.from("newsroom_daily_priorities").insert({
    priority_label,
    priority_type: String(formData.get("priority_type") || "story"),
    status: String(formData.get("status") || "planned"),
    rank: Number(formData.get("rank") || 10),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_slot: String(formData.get("target_slot") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function addDecision(formData: FormData) {
  "use server";
  const decision_title = String(formData.get("decision_title") || "").trim();
  if (!decision_title) return;
  await supabase.from("newsroom_decision_log").insert({
    decision_title,
    decision_body: String(formData.get("decision_body") || "").trim() || null,
    decision_area: String(formData.get("decision_area") || "publishing"),
    decided_by: String(formData.get("decided_by") || "Admin / Editor").trim() || "Admin / Editor",
    status: String(formData.get("status") || "active"),
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status || !["newsroom_handoff_notes", "newsroom_daily_priorities", "newsroom_decision_log"].includes(table)) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "newsroom_handoff_notes" && ["done", "resolved", "archived"].includes(status)) patch.resolved_at = new Date().toISOString();
  if (table === "newsroom_daily_priorities" && status === "done") patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function HandoffPage() {
  const snapshot = await getHandoffSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Handoff ready", `${snapshot.score}%`, "Admin/editor coordination health", scoreTone],
    ["Needs reply", snapshot.needsReply.length, "Notes waiting on the other person", snapshot.needsReply.length ? "bad" : "good"],
    ["Priorities", snapshot.openPriorities.length, "Open items for today", snapshot.openPriorities.length > 5 ? "warn" : "good"],
    ["Decisions", snapshot.activeDecisions.length, "Active working agreements", snapshot.activeDecisions.length ? "good" : "warn"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v96 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Handoff Desk</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A tiny coordination board for the two-person HGN beta: what matters today, what needs a reply and what decisions should stay consistent.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link><Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link><Link href="/handoff-status" className="hgn-btn-primary">Status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${handoffToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Today priorities</h2><p className="mt-1 text-sm text-slate-600">Keep this list short. This is not a project manager; it is the daily newsroom focus.</p><div className="mt-4 grid gap-3">{snapshot.priorities.length ? snapshot.priorities.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${handoffToneClasses(handoffTone(item.status, false, item.rank))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">#{item.rank} · {item.priority_type} · {item.status} · {item.owner || "Admin / Editor"}</div><h3 className="mt-1 text-lg font-black">{item.priority_label}</h3>{item.target_slot && <p className="mt-2 rounded-lg bg-white/60 p-2 text-sm font-bold">Slot: {item.target_slot}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="newsroom_daily_priorities" id={item.id} values={["planned", "doing", "done", "blocked", "dropped"]} /></article>) : <Empty label="No priorities yet." />}</div>
        <form action={addPriority} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add priority</h3><label>Priority<input name="priority_label" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Rank<input name="rank" type="number" defaultValue="10" /></label><label>Type<select name="priority_type" defaultValue="story"><option>story</option><option>homepage</option><option>photo</option><option>correction</option><option>admin</option></select></label><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>doing</option><option>done</option><option>blocked</option><option>dropped</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Owner<input name="owner" defaultValue="Admin / Editor" /></label><label>Target slot<input name="target_slot" placeholder="Hero, Latest, Community, etc." /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save priority</button></form>
      </div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Handoff notes</h2><div className="mt-4 grid gap-3">{snapshot.notes.length ? snapshot.notes.map((note) => <article key={note.id} className={`rounded-xl border p-4 ${handoffToneClasses(handoffTone(note.status, note.needs_reply))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{note.handoff_type} · {note.status} · {note.owner || "Admin / Editor"}</div><h3 className="mt-1 font-black">{note.note_title}</h3>{note.note_body && <p className="mt-2 text-sm opacity-80">{note.note_body}</p>}{note.needs_reply && <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs font-black">Needs reply</p>}<StatusButtons table="newsroom_handoff_notes" id={note.id} values={["open", "answered", "done", "resolved", "archived"]} /></article>) : <Empty label="No handoff notes yet." />}</div><form action={addNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add handoff note</h3><label>Title<input name="note_title" required /></label><label>Note<textarea name="note_body" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<select name="handoff_type" defaultValue="daily"><option>daily</option><option>publishing</option><option>homepage</option><option>question</option><option>reminder</option></select></label><label>Status<select name="status" defaultValue="open"><option>open</option><option>answered</option><option>done</option><option>resolved</option></select></label></div><label>Owner<input name="owner" defaultValue="Admin / Editor" /></label><label className="flex items-center gap-2 text-sm font-bold"><input name="needs_reply" type="checkbox" /> Needs reply</label><button className="hgn-btn-primary">Save note</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Decision log</h2><div className="mt-4 grid gap-3">{snapshot.decisions.length ? snapshot.decisions.map((decision) => <article key={decision.id} className={`rounded-xl border p-4 ${handoffToneClasses(handoffTone(decision.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{decision.decision_area} · {decision.status} · {decision.decided_by || "Admin / Editor"}</div><h3 className="mt-1 font-black">{decision.decision_title}</h3>{decision.decision_body && <p className="mt-2 text-sm opacity-80">{decision.decision_body}</p>}<StatusButtons table="newsroom_decision_log" id={decision.id} values={["active", "changed", "archived"]} /></article>) : <Empty label="No working decisions yet." />}</div><form action={addDecision} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add decision</h3><label>Decision<input name="decision_title" required /></label><label>Details<textarea name="decision_body" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Area<input name="decision_area" defaultValue="publishing" /></label><label>Decided by<input name="decided_by" defaultValue="Admin / Editor" /></label></div><button className="hgn-btn-primary">Save decision</button></form></div></div>
    </section>
  </main>;
}
