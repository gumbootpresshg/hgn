import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { dailyTone, dailyToneClasses, getDailyCommandSnapshot } from "@/lib/daily-command";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createRun(formData: FormData) {
  "use server";
  await supabase.from("daily_operator_runs").insert({
    run_date: String(formData.get("run_date") || new Date().toISOString().slice(0, 10)),
    shift_label: String(formData.get("shift_label") || "Daily desk").trim(),
    editor_on_duty: String(formData.get("editor_on_duty") || "").trim() || null,
    operator_on_duty: String(formData.get("operator_on_duty") || "").trim() || null,
    publishing_goal: String(formData.get("publishing_goal") || "").trim() || null,
    homepage_goal: String(formData.get("homepage_goal") || "").trim() || null,
    newsletter_goal: String(formData.get("newsletter_goal") || "").trim() || null,
    blockers: String(formData.get("blockers") || "").trim() || null,
    status: "open",
    readiness_score: Number(formData.get("readiness_score") || 55),
  });
}

async function createTask(formData: FormData) {
  "use server";
  const task_title = String(formData.get("task_title") || "").trim();
  if (!task_title) return;
  await supabase.from("daily_operator_tasks").insert({
    run_id: String(formData.get("run_id") || "") || null,
    task_title,
    task_area: String(formData.get("task_area") || "publishing"),
    owner: String(formData.get("owner") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    status: String(formData.get("status") || "todo"),
    due_today: formData.get("due_today") === "on",
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    next_step: String(formData.get("next_step") || "").trim() || null,
  });
}

async function createHandoff(formData: FormData) {
  "use server";
  const subject = String(formData.get("subject") || "").trim();
  if (!subject) return;
  await supabase.from("daily_operator_handoffs").insert({
    run_id: String(formData.get("run_id") || "") || null,
    from_person: String(formData.get("from_person") || "").trim() || null,
    to_person: String(formData.get("to_person") || "").trim() || null,
    subject,
    note: String(formData.get("note") || "").trim() || null,
    status: String(formData.get("status") || "open"),
  });
}

async function createSlot(formData: FormData) {
  "use server";
  const slot_name = String(formData.get("slot_name") || "").trim();
  if (!slot_name) return;
  await supabase.from("daily_focus_slots").insert({
    run_id: String(formData.get("run_id") || "") || null,
    slot_name,
    slot_order: Number(formData.get("slot_order") || 0),
    story_title: String(formData.get("story_title") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    status: String(formData.get("status") || "planned"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["daily_operator_runs", "daily_operator_tasks", "daily_operator_handoffs", "daily_focus_slots"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["done", "closed", "published", "filled", "sent"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) { return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>; }

export default async function DailyCommandPage() {
  const snapshot = await getDailyCommandSnapshot();
  const run = snapshot.activeRun;
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Daily readiness", `${snapshot.score}%`, "Can the two-person desk publish cleanly today?", signal],
    ["Open tasks", snapshot.openTasks.length, "Keep this small and realistic", snapshot.openTasks.length > 8 ? "warn" : "good"],
    ["Blocked", snapshot.blockedTasks.length, "Anything stuck enough to stop publishing", snapshot.blockedTasks.length ? "bad" : "good"],
    ["Focus slots", snapshot.filledSlots.length, "Homepage/story slots with shape", snapshot.filledSlots.length >= 2 ? "good" : "warn"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v90 Two-person Newsroom Flow</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Daily Command</h1><p className="mt-3 max-w-3xl text-slate-700">A lean daily desk for the real beta team: the admin and editor. Pick the day&apos;s priority, keep the homepage current, finish the necessary checks, and leave a clear handoff.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/editor-workbench" className="hgn-btn-dark">Editor workbench</Link><Link href="/operator-status" className="hgn-btn-primary">Operator status</Link><Link href="/admin" className="hgn-btn-dark">Admin</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${dailyToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Today&apos;s operating brief</h2>{run ? <article className={`mt-4 rounded-2xl border p-5 ${dailyToneClasses(dailyTone(run.status))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{run.run_date} · {run.status}</div><h3 className="mt-1 text-2xl font-black">{run.shift_label}</h3><div className="mt-3 grid gap-3 text-sm md:grid-cols-2"><p><b>Admin:</b> {run.operator_on_duty || "Not set"}</p><p><b>Editor:</b> {run.editor_on_duty || "Not set"}</p></div><div className="mt-4 grid gap-3 text-sm"><p><b>Publishing goal:</b> {run.publishing_goal || "Not set"}</p><p><b>Homepage goal:</b> {run.homepage_goal || "Not set"}</p><p><b>Newsletter/social:</b> {run.newsletter_goal || "Only if useful"}</p>{run.blockers && <p><b>Blockers:</b> {run.blockers}</p>}{run.handoff_notes && <p><b>Handoff:</b> {run.handoff_notes}</p>}</div><StatusButtons table="daily_operator_runs" id={run.id} values={["open", "doing", "ready", "closed"]} /></article> : <Empty label="No daily run yet." />}
        <form action={createRun} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Start a new daily run</h3><div className="grid gap-3 md:grid-cols-4"><label>Date<input name="run_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><label>Label<input name="shift_label" defaultValue="Daily desk" /></label><label>Admin<input name="operator_on_duty" placeholder="You" /></label><label>Editor<input name="editor_on_duty" placeholder="Editor" /></label></div><label>Publishing goal<textarea name="publishing_goal" rows={2} placeholder="What must get published or improved today?" /></label><label>Homepage goal<textarea name="homepage_goal" rows={2} placeholder="What should feel current on the front page?" /></label><label>Newsletter/social goal<textarea name="newsletter_goal" rows={2} placeholder="Only send/share if the value is clear." /></label><div className="grid gap-3 md:grid-cols-[1fr_160px]"><label>Known blockers<textarea name="blockers" rows={2} /></label><label>Base score<input name="readiness_score" type="number" min="0" max="100" defaultValue="55" /></label></div><button className="hgn-btn-primary">Create daily run</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Focus slots</h2><div className="mt-4 grid gap-3">{snapshot.slots.length ? snapshot.slots.map((slot) => <article key={slot.id} className={`rounded-xl border p-4 ${dailyToneClasses(dailyTone(slot.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Slot {slot.slot_order} · {slot.status}</div><h3 className="mt-1 font-black">{slot.slot_name}</h3><p className="mt-1 text-sm opacity-80">{[slot.story_title, slot.article_slug].filter(Boolean).join(" · ") || "Not filled yet"}</p>{slot.notes && <p className="mt-2 text-sm opacity-80">{slot.notes}</p>}<StatusButtons table="daily_focus_slots" id={slot.id} values={["planned", "filled", "needs_update", "done"]} /></article>) : <Empty label="No focus slots yet." />}</div><form action={createSlot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add focus slot</h3><input type="hidden" name="run_id" value={run?.id || ""} /><div className="grid gap-3 md:grid-cols-3"><label>Slot<input name="slot_name" required placeholder="Lead story" /></label><label>Order<input name="slot_order" type="number" defaultValue="1" /></label><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>filled</option><option>needs_update</option><option>done</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Story title<input name="story_title" /></label><label>Article slug<input name="article_slug" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save slot</button></form></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Tiny task list</h2><p className="mt-1 text-sm text-slate-600">Keep this list short. If it is not helping today&apos;s publish/homepage flow, park it elsewhere.</p><div className="mt-4 grid gap-3">{snapshot.tasks.length ? snapshot.tasks.map((task) => <article key={task.id} className={`rounded-xl border p-4 ${dailyToneClasses(dailyTone(task.status, task.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{task.task_area} · {task.priority} · {task.status}</div><h3 className="mt-1 font-black">{task.task_title}</h3><p className="mt-1 text-sm opacity-80">{[task.owner, task.article_slug].filter(Boolean).join(" · ") || "No owner"}</p>{task.next_step && <p className="mt-2 text-sm opacity-80">Next: {task.next_step}</p>}<StatusButtons table="daily_operator_tasks" id={task.id} values={["todo", "doing", "blocked", "done"]} /></article>) : <Empty label="No daily tasks yet." />}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><input type="hidden" name="run_id" value={run?.id || ""} /><label>Task<input name="task_title" required /></label><div className="grid gap-3 md:grid-cols-4"><label>Area<input name="task_area" defaultValue="publishing" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>blocked</option><option>done</option></select></label></div><div className="grid gap-3 md:grid-cols-[1fr_140px]"><label>Article slug<input name="article_slug" /></label><label className="flex items-center gap-2 pt-6"><input name="due_today" type="checkbox" defaultChecked /> Due today</label></div><label>Next step<textarea name="next_step" rows={2} /></label><button className="hgn-btn-primary">Save task</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Admin/editor handoff</h2><p className="mt-1 text-sm text-slate-600">Use this so the next session starts fast without digging through messages.</p><div className="mt-4 grid gap-3">{snapshot.handoffs.length ? snapshot.handoffs.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${dailyToneClasses(dailyTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.status}</div><h3 className="mt-1 font-black">{item.subject}</h3><p className="mt-1 text-xs opacity-70">{[item.from_person, item.to_person].filter(Boolean).join(" → ")}</p>{item.note && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.note}</p>}<StatusButtons table="daily_operator_handoffs" id={item.id} values={["open", "doing", "done", "closed"]} /></article>) : <Empty label="No handoffs yet." />}</div><form action={createHandoff} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add handoff</h3><input type="hidden" name="run_id" value={run?.id || ""} /><div className="grid gap-3 md:grid-cols-3"><label>From<input name="from_person" /></label><label>To<input name="to_person" /></label><label>Status<select name="status" defaultValue="open"><option>open</option><option>doing</option><option>done</option><option>closed</option></select></label></div><label>Subject<input name="subject" required /></label><label>Note<textarea name="note" rows={5} /></label><button className="hgn-btn-primary">Save handoff</button></form></div>
    </section>
  </main>;
}
