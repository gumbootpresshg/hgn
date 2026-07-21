import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getLaunchRoomSnapshot, launchTone, launchToneClasses } from "@/lib/launch-room";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createDecision(formData: FormData) {
  "use server";
  const decision = String(formData.get("decision") || "watch");
  await supabase.from("beta_launch_decisions").insert({
    decision,
    decision_date: String(formData.get("decision_date") || new Date().toISOString().slice(0, 10)),
    decided_by: String(formData.get("decided_by") || "").trim() || null,
    readiness_score: Number(formData.get("readiness_score") || 0),
    blockers_count: Number(formData.get("blockers_count") || 0),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_release_tasks").insert({
    title,
    area: String(formData.get("area") || "Launch").trim() || "Launch",
    owner: String(formData.get("owner") || "").trim() || null,
    status: String(formData.get("status") || "pending"),
    priority: String(formData.get("priority") || "normal"),
    due_date: String(formData.get("due_date") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateTask(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["done", "complete"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from("beta_release_tasks").update(patch).eq("id", id);
}

async function createComms(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_comms_queue").insert({
    title,
    channel: String(formData.get("channel") || "newsletter"),
    audience: String(formData.get("audience") || "beta-readers"),
    status: String(formData.get("status") || "draft"),
    send_at: String(formData.get("send_at") || "") || null,
    body: String(formData.get("body") || "").trim() || null,
  });
}

async function updateComms(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "draft");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  await supabase.from("beta_comms_queue").update(patch).eq("id", id);
}

export default async function LaunchRoomPage() {
  const snapshot = await getLaunchRoomSnapshot();
  const decisionTone = snapshot.blockers > 0 ? "bad" : snapshot.score >= 85 ? "good" : snapshot.score >= 70 ? "warn" : "bad";
  const stats = [
    ["Release score", `${snapshot.score}%`, "Ops readiness plus story preflight minus open launch tasks", decisionTone],
    ["Launch blockers", snapshot.blockers, "Incidents, checklist blockers, preflight risks and red release tasks", snapshot.blockers ? "bad" : "good"],
    ["Open tasks", snapshot.openTasks, "Launch tasks not finished yet", snapshot.openTasks ? "warn" : "good"],
    ["Comms ready", snapshot.commsReady, "Approved, scheduled or sent messages", snapshot.commsReady ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v68 Beta Launch Room</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Go / No-Go Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">The final beta control room: launch decision, release tasks, reader communications and the current operational signal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/beta-ops" className="hgn-btn-dark">Beta ops</Link>
          <Link href="/admin/preflight" className="hgn-btn-primary">Preflight</Link>
          <Link href="/release-notes" className="hgn-btn-dark">Release notes</Link>
        </div>
      </div>

      <section className={`mt-8 rounded-3xl border p-6 shadow-sm ${launchToneClasses(decisionTone)}`}>
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Current signal</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-black">{snapshot.decisionLabel}</h2>
            <p className="mt-2 max-w-3xl font-semibold opacity-80">Beta ops is {snapshot.ops.readiness}%, story preflight average is {snapshot.preflight.averageScore}%, and there are {snapshot.blockers} combined launch blockers.</p>
          </div>
          <div className="text-6xl font-black">{snapshot.score}%</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${launchToneClasses(tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Release task board</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.tasks.map((task) => (
              <form key={task.id} action={updateTask} className={`rounded-xl border p-4 ${launchToneClasses(launchTone(task.status))}`}>
                <input type="hidden" name="id" value={task.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{task.area || "Launch"} · {task.priority || "normal"} · {task.status || "pending"}</div>
                    <h3 className="mt-1 font-black">{task.title}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">Owner: {task.owner || "Unassigned"}{task.due_date ? ` · Due ${task.due_date}` : ""}</p>
                    {task.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{task.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button name="status" value="in_progress" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Work</button>
                    <button name="status" value="blocked" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Block</button>
                    <button name="status" value="done" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Done</button>
                  </div>
                </div>
              </form>
            ))}
            {!snapshot.tasks.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Run the v68 SQL to seed release tasks.</p>}
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Record decision</h2>
            <form action={createDecision} className="mt-5 grid gap-3">
              <input type="hidden" name="readiness_score" value={snapshot.score} />
              <input type="hidden" name="blockers_count" value={snapshot.blockers} />
              <label>Decision<select name="decision" defaultValue={snapshot.blockers ? "no_go" : snapshot.score >= 85 ? "go" : "watch"}><option value="go">go</option><option value="watch">watch</option><option value="no_go">no_go</option></select></label>
              <label>Date<input name="decision_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
              <label>Decided by<input name="decided_by" placeholder="Editor / publisher" /></label>
              <label>Notes<textarea name="notes" rows={4} placeholder="What changed, what is blocked, and what happens next." /></label>
              <button className="hgn-btn-primary">Save decision</button>
            </form>
          </div>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add release task</h2>
            <form action={createTask} className="mt-5 grid gap-3">
              <label>Title<input name="title" required placeholder="Confirm mobile homepage" /></label>
              <div className="grid gap-3 md:grid-cols-2"><label>Area<input name="area" defaultValue="Launch" /></label><label>Owner<input name="owner" /></label></div>
              <div className="grid gap-3 md:grid-cols-2"><label>Status<select name="status" defaultValue="pending"><option>pending</option><option>in_progress</option><option>blocked</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>normal</option><option>high</option><option>critical</option></select></label></div>
              <label>Due date<input name="due_date" type="date" /></label>
              <label>Notes<textarea name="notes" rows={3} /></label>
              <button className="hgn-btn-dark">Add task</button>
            </form>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Beta communications queue</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.comms.map((item) => (
              <form key={item.id} action={updateComms} className={`rounded-xl border p-4 ${launchToneClasses(launchTone(item.status))}`}>
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{item.channel} · {item.audience} · {item.status}</div>
                    <h3 className="mt-1 font-black">{item.title}</h3>
                    {item.send_at && <p className="mt-1 text-sm font-semibold opacity-80">Send at: {item.send_at}</p>}
                    {item.body && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.body}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button name="status" value="approved" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Approve</button>
                    <button name="status" value="scheduled" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Schedule</button>
                    <button name="status" value="sent" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">Sent</button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Add beta comms</h2>
          <form action={createComms} className="mt-5 grid gap-3">
            <label>Title<input name="title" required placeholder="Closed beta invite email" /></label>
            <div className="grid gap-3 md:grid-cols-3"><label>Channel<select name="channel" defaultValue="newsletter"><option>newsletter</option><option>social</option><option>site-banner</option><option>direct</option></select></label><label>Audience<select name="audience" defaultValue="beta-readers"><option>beta-readers</option><option>contributors</option><option>advertisers</option><option>public</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>approved</option><option>scheduled</option><option>sent</option></select></label></div>
            <label>Send at<input name="send_at" type="datetime-local" /></label>
            <label>Message<textarea name="body" rows={6} placeholder="Draft the note testers or readers will see." /></label>
            <button className="hgn-btn-primary">Add communication</button>
          </form>
        </div>
      </section>

      <section className="mt-8 hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Decision history</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {snapshot.decisions.map((decision) => (
            <article key={decision.id} className={`rounded-xl border p-4 ${launchToneClasses(launchTone(decision.decision))}`}>
              <div className="text-xs font-black uppercase tracking-wide opacity-70">{decision.decision_date} · {decision.decision}</div>
              <h3 className="mt-1 font-black">{decision.readiness_score}% readiness · {decision.blockers_count} blockers</h3>
              <p className="mt-1 text-sm font-semibold opacity-80">By: {decision.decided_by || "Unassigned"}</p>
              {decision.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{decision.notes}</p>}
            </article>
          ))}
          {!snapshot.decisions.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No formal launch decisions recorded yet.</p>}
        </div>
      </section>
    </main>
  );
}
