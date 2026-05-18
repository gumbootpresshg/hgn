import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { distributionTone, distributionToneClasses, getDistributionSnapshot } from "@/lib/distribution-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createRun(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("distribution_runs").insert({
    title,
    story_slug: String(formData.get("story_slug") || "").trim() || null,
    status: String(formData.get("status") || "planned"),
    priority: String(formData.get("priority") || "normal"),
    publish_date: String(formData.get("publish_date") || new Date().toISOString().slice(0, 10)),
    publish_window: String(formData.get("publish_window") || "same day"),
    owner: String(formData.get("owner") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    newsletter_angle: String(formData.get("newsletter_angle") || "").trim() || null,
    social_angle: String(formData.get("social_angle") || "").trim() || null,
    seo_check: formData.get("seo_check") === "on",
    rss_check: formData.get("rss_check") === "on",
    image_check: formData.get("image_check") === "on",
    link_check: formData.get("link_check") === "on",
    followup_needed: formData.get("followup_needed") === "on",
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createChannel(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("distribution_channels").insert({
    name,
    channel_type: String(formData.get("channel_type") || "social"),
    status: String(formData.get("status") || "active"),
    owner: String(formData.get("owner") || "").trim() || null,
    audience_note: String(formData.get("audience_note") || "").trim() || null,
    posting_cadence: String(formData.get("posting_cadence") || "").trim() || null,
    url: String(formData.get("url") || "").trim() || null,
    is_primary: formData.get("is_primary") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("distribution_tasks").insert({
    title,
    run_id: String(formData.get("run_id") || "") || null,
    channel_id: String(formData.get("channel_id") || "") || null,
    task_type: String(formData.get("task_type") || "post"),
    status: String(formData.get("status") || "todo"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_at: String(formData.get("due_at") || "") || null,
    copy: String(formData.get("copy") || "").trim() || null,
    destination_url: String(formData.get("destination_url") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["distribution_runs", "distribution_tasks", "distribution_channels"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "distribution_tasks" && ["done", "sent", "published", "complete", "completed"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function DistributionDeskPage() {
  const snapshot = await getDistributionSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const today = new Date().toISOString().slice(0, 10);
  const stats = [
    ["Distribution readiness", `${snapshot.score}%`, "Channels, runs, QA checks and follow-ups", signal],
    ["Active channels", snapshot.activeChannels.length, "Ready places to distribute stories", snapshot.activeChannels.length ? "good" : "warn"],
    ["Open runs", snapshot.openRuns.length, "Stories needing distribution follow-through", snapshot.openRuns.length ? "warn" : "good"],
    ["Blocked tasks", snapshot.blockedTasks.length, "Items that can stop launch momentum", snapshot.blockedTasks.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v79 Distribution Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Distribution Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Make sure each beta story has a clean path from publish to RSS, newsletter, social, and follow-up.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/follow-hgn" className="hgn-btn-primary">Public follow page</Link><Link href="/admin/comms" className="hgn-btn-dark">Comms</Link><Link href="/admin/newsletter-desk" className="hgn-btn-dark">Newsletter</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${distributionToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Distribution runs</h2><div className="mt-5 grid gap-3">{snapshot.runs.map((run) => <article key={run.id} className={`rounded-xl border p-4 ${distributionToneClasses(distributionTone(run.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{run.publish_date} · {run.publish_window} · {run.status} · {run.priority}</div><h3 className="mt-1 text-xl font-black">{run.title}</h3><p className="mt-2 text-sm font-semibold opacity-80">Owner: {run.owner || "Unassigned"}{run.story_slug ? ` · Slug: ${run.story_slug}` : ""}{run.followup_needed ? " · Follow-up needed" : ""}</p>{run.summary && <p className="mt-2 text-sm opacity-80">{run.summary}</p>}<div className="mt-3 flex flex-wrap gap-2 text-xs font-black"><span className={run.seo_check ? "text-green-800" : "text-hgnBlue"}>SEO</span><span className={run.rss_check ? "text-green-800" : "text-hgnBlue"}>RSS</span><span className={run.image_check ? "text-green-800" : "text-hgnBlue"}>Image</span><span className={run.link_check ? "text-green-800" : "text-hgnBlue"}>Links</span></div><StatusButtons table="distribution_runs" id={run.id} values={["planned", "queued", "in progress", "ready", "done", "blocked"]} /></article>)}{!snapshot.runs.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No distribution runs yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add distribution run</h2><form action={createRun} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Story slug<input name="story_slug" /></label><label>Owner<input name="owner" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>queued</option><option>in progress</option><option>ready</option><option>done</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Publish date<input name="publish_date" type="date" defaultValue={today} /></label></div><label>Publish window<input name="publish_window" defaultValue="same day" /></label><label>Summary<textarea name="summary" rows={2} /></label><label>Newsletter angle<textarea name="newsletter_angle" rows={2} /></label><label>Social angle<textarea name="social_angle" rows={2} /></label><div className="grid gap-2 text-sm font-bold sm:grid-cols-2"><label className="flex items-center gap-2"><input name="seo_check" type="checkbox" /> SEO checked</label><label className="flex items-center gap-2"><input name="rss_check" type="checkbox" /> RSS checked</label><label className="flex items-center gap-2"><input name="image_check" type="checkbox" /> Image checked</label><label className="flex items-center gap-2"><input name="link_check" type="checkbox" /> Links checked</label><label className="flex items-center gap-2"><input name="followup_needed" type="checkbox" /> Follow-up needed</label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save run</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Channels</h2><div className="mt-5 grid gap-3">{snapshot.channels.map((channel) => <article key={channel.id} className={`rounded-xl border p-4 ${distributionToneClasses(distributionTone(channel.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{channel.channel_type} · {channel.status} · order {channel.sort_order}</div><h3 className="mt-1 font-black">{channel.name}</h3><p className="mt-2 text-sm font-semibold opacity-80">Owner: {channel.owner || "TBD"}{channel.posting_cadence ? ` · ${channel.posting_cadence}` : ""}{channel.is_primary ? " · Primary" : ""}</p>{channel.audience_note && <p className="mt-1 text-sm opacity-80">{channel.audience_note}</p>}<StatusButtons table="distribution_channels" id={channel.id} values={["active", "planned", "paused", "retired"]} /></article>)}</div><form action={createChannel} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add channel</h3><label>Name<input name="name" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="channel_type" defaultValue="social" /></label><label>Status<input name="status" defaultValue="active" /></label><label>Order<input name="sort_order" type="number" defaultValue="100" /></label></div><label>Owner<input name="owner" /></label><label>URL<input name="url" /></label><label>Cadence<input name="posting_cadence" /></label><label>Audience note<textarea name="audience_note" rows={2} /></label><label className="flex items-center gap-2 font-bold"><input name="is_primary" type="checkbox" /> Primary channel</label><button className="hgn-btn-dark">Save channel</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Distribution tasks</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((task) => <article key={task.id} className={`rounded-xl border p-4 ${distributionToneClasses(distributionTone(task.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{task.task_type} · {task.status} · {task.due_at ? new Date(task.due_at).toLocaleString() : "no due date"}</div><h3 className="mt-1 font-black">{task.title}</h3><p className="mt-2 text-sm font-semibold opacity-80">Owner: {task.owner || "TBD"}</p>{task.copy && <p className="mt-1 text-sm opacity-80">{task.copy}</p>}<StatusButtons table="distribution_tasks" id={task.id} values={["todo", "queued", "in progress", "done", "blocked"]} /></article>)}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Run<select name="run_id"><option value="">None</option>{snapshot.runs.map((run) => <option key={run.id} value={run.id}>{run.title}</option>)}</select></label><label>Channel<select name="channel_id"><option value="">None</option>{snapshot.channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</select></label></div><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="task_type" defaultValue="post" /></label><label>Status<input name="status" defaultValue="todo" /></label><label>Owner<input name="owner" /></label></div><label>Due at<input name="due_at" type="datetime-local" /></label><label>Destination URL<input name="destination_url" /></label><label>Copy<textarea name="copy" rows={3} /></label><label>Notes<textarea name="notes" rows={2} /></label><button className="hgn-btn-primary">Save task</button></form></div>
    </section>
  </main>;
}
