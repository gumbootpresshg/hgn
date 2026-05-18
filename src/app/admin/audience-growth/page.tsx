import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { audienceTone, audienceToneClasses, getAudienceGrowthSnapshot } from "@/lib/audience-growth";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createCampaign(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("audience_campaigns").insert({
    title,
    channel: String(formData.get("channel") || "newsletter"),
    status: String(formData.get("status") || "draft"),
    audience_goal: String(formData.get("audience_goal") || "").trim() || null,
    target_segment: String(formData.get("target_segment") || "general readers"),
    call_to_action: String(formData.get("call_to_action") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createChannel(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("audience_channels").insert({
    name,
    channel_type: String(formData.get("channel_type") || "social"),
    status: String(formData.get("status") || "planned"),
    owner: String(formData.get("owner") || "").trim() || null,
    cadence: String(formData.get("cadence") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("audience_growth_tasks").insert({
    title,
    area: String(formData.get("area") || "newsletter"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["audience_campaigns", "audience_channels", "audience_growth_tasks", "audience_experiments"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function AudienceGrowthPage() {
  const snapshot = await getAudienceGrowthSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Audience readiness", `${snapshot.score}%`, "Campaigns, channels, tasks and experiments", signal],
    ["Live campaigns", snapshot.liveCampaigns, "Newsletter/social/community pushes in market", snapshot.liveCampaigns ? "good" : "warn"],
    ["Ready channels", snapshot.readyChannels, "Growth channels ready for beta", snapshot.readyChannels ? "good" : "warn"],
    ["Blockers", snapshot.blockers.length, "Growth items blocking launch momentum", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v73 Audience Growth</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Audience Growth Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Run the beta audience engine: newsletter pushes, social channels, reader acquisition tasks and growth experiments from one command view.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/audience-lab" className="hgn-btn-primary">Public audience lab</Link><Link href="/admin/comms" className="hgn-btn-dark">Comms</Link><Link href="/admin/beta-testers" className="hgn-btn-dark">Beta testers</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${audienceToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Campaign board</h2><div className="mt-5 grid gap-3">{snapshot.campaigns.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${audienceToneClasses(audienceTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.channel} · {item.status} · {item.target_segment}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.audience_goal && <p className="mt-1 text-sm font-semibold opacity-80">Goal: {item.audience_goal}</p>}{item.call_to_action && <p className="mt-2 text-sm opacity-80">CTA: {item.call_to_action}</p>}{item.owner && <p className="mt-2 text-sm opacity-80">Owner: {item.owner}</p>}<StatusButtons table="audience_campaigns" id={item.id} values={["draft", "queued", "live", "sent"]} /></article>)}{!snapshot.campaigns.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No audience campaigns yet.</p>}</div></div>
      <aside className="grid content-start gap-6">
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add campaign</h2><form action={createCampaign} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Channel<select name="channel" defaultValue="newsletter"><option>newsletter</option><option>facebook</option><option>instagram</option><option>community</option><option>print</option><option>partner</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>queued</option><option>live</option><option>sent</option></select></label><label>Segment<input name="target_segment" defaultValue="general readers" /></label></div><label>Audience goal<input name="audience_goal" placeholder="Example: 100 beta newsletter signups" /></label><label>Call to action<input name="call_to_action" /></label><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={4} /></label><button className="hgn-btn-primary">Save campaign</button></form></div>
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add channel</h2><form action={createChannel} className="mt-5 grid gap-3"><label>Name<input name="name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<select name="channel_type" defaultValue="social"><option>newsletter</option><option>social</option><option>community</option><option>partner</option><option>search</option></select></label><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>ready</option><option>active</option><option>paused</option></select></label></div><label>Cadence<input name="cadence" placeholder="Daily, weekly, launch week" /></label><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save channel</button></form></div>
      </aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Growth channels</h2><div className="mt-5 grid gap-3">{snapshot.channels.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${audienceToneClasses(audienceTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.channel_type} · {item.status}</div><h3 className="mt-1 font-black">{item.name}</h3>{item.cadence && <p className="mt-1 text-sm font-semibold opacity-80">Cadence: {item.cadence}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="audience_channels" id={item.id} values={["planned", "ready", "active", "paused"]} /></article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Audience tasks</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${audienceToneClasses(audienceTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="audience_growth_tasks" id={item.id} values={["doing", "blocked", "ready", "done"]} /></article>)}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Create task</h3><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<select name="area" defaultValue="newsletter"><option>newsletter</option><option>social</option><option>referrals</option><option>onboarding</option><option>analytics</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>blocked</option><option>ready</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save task</button></form></div>
    </section>
  </main>;
}
