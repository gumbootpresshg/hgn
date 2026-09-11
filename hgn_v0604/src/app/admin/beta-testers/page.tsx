import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getBetaTesterSnapshot, testerTone, testerToneClasses } from "@/lib/beta-testers";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addTester(formData: FormData) {
  "use server";
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!full_name || !email) return;
  await supabase.from("beta_testers").upsert({
    full_name,
    email,
    community: String(formData.get("community") || "").trim() || null,
    role: String(formData.get("role") || "reader"),
    device: String(formData.get("device") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    status: String(formData.get("status") || "new"),
    source: "admin",
    interests: String(formData.get("interests") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "email" });
}

async function updateTester(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "new");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "invited") patch.invite_sent_at = new Date().toISOString();
  if (status === "active") patch.activated_at = new Date().toISOString();
  if (status === "complete") patch.completed_at = new Date().toISOString();
  await supabase.from("beta_testers").update(patch).eq("id", id);
}

async function addBatch(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_invite_batches").insert({
    title,
    audience: String(formData.get("audience") || "readers"),
    status: String(formData.get("status") || "draft"),
    target_count: Number(formData.get("target_count") || 0),
    owner: String(formData.get("owner") || "").trim() || null,
    send_date: String(formData.get("send_date") || "") || null,
    message: String(formData.get("message") || "").trim() || null,
  });
}

async function updateBatch(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "draft");
  if (!id) return;
  await supabase.from("beta_invite_batches").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

async function addTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_onboarding_tasks").insert({
    title,
    audience: String(formData.get("audience") || "all"),
    status: String(formData.get("status") || "active"),
    sort_order: Number(formData.get("sort_order") || 100),
    instructions: String(formData.get("instructions") || "").trim() || null,
  });
}

async function updateTask(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "active");
  if (!id) return;
  await supabase.from("beta_onboarding_tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

export default async function BetaTestersPage() {
  const snapshot = await getBetaTesterSnapshot();
  const stats = [
    ["Tester readiness", `${snapshot.score}%`, "Tester pipeline plus onboarding checklist", snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad"],
    ["Active testers", snapshot.active, "People currently testing the beta", snapshot.active >= 8 ? "good" : "warn"],
    ["Invited", snapshot.invited, "Invites sent but not active yet", snapshot.invited ? "warn" : "neutral"],
    ["Waiting list", snapshot.waiting, "New signups to triage", snapshot.waiting ? "warn" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v69 Beta Tester Desk</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Tester Intake + Onboarding</h1>
          <p className="mt-3 max-w-3xl text-slate-700">Manage closed beta signups, invite waves and the exact tasks testers should run before public beta.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/beta-join" className="hgn-btn-primary">Public signup</Link>
          <Link href="/admin/launch-room" className="hgn-btn-dark">Launch room</Link>
          <Link href="/admin/beta-ops" className="hgn-btn-dark">Beta ops</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${testerToneClasses(tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Tester pipeline</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.testers.map((tester) => (
              <form key={tester.id} action={updateTester} className={`rounded-xl border p-4 ${testerToneClasses(testerTone(tester.status))}`}>
                <input type="hidden" name="id" value={tester.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{tester.role} · {tester.status} · {tester.priority}</div>
                    <h3 className="mt-1 font-black">{tester.full_name}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">{tester.email}{tester.community ? ` · ${tester.community}` : ""}{tester.device ? ` · ${tester.device}` : ""}</p>
                    {tester.interests && <p className="mt-2 text-sm opacity-80">Interests: {tester.interests}</p>}
                    {tester.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{tester.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button name="status" value="invited" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Invited</button>
                    <button name="status" value="active" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Active</button>
                    <button name="status" value="paused" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Pause</button>
                    <button name="status" value="complete" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">Complete</button>
                  </div>
                </div>
              </form>
            ))}
            {!snapshot.testers.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No beta testers yet. Share /beta-join or add testers manually.</p>}
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add tester</h2>
            <form action={addTester} className="mt-5 grid gap-3">
              <label>Name<input name="full_name" required placeholder="Jane Jones" /></label>
              <label>Email<input name="email" type="email" required placeholder="jane@example.com" /></label>
              <div className="grid gap-3 md:grid-cols-2"><label>Community<input name="community" placeholder="Masset" /></label><label>Device<input name="device" placeholder="iPhone / Android / laptop" /></label></div>
              <div className="grid gap-3 md:grid-cols-3"><label>Role<select name="role" defaultValue="reader"><option>reader</option><option>contributor</option><option>business</option><option>advertiser</option><option>community_org</option><option>staff</option><option>other</option></select></label><label>Status<select name="status" defaultValue="new"><option>new</option><option>invited</option><option>active</option><option>paused</option><option>complete</option><option>declined</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>critical</option></select></label></div>
              <label>Interests<input name="interests" placeholder="mobile, submissions, local events" /></label>
              <label>Notes<textarea name="notes" rows={4} /></label>
              <button className="hgn-btn-primary">Save tester</button>
            </form>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Invite batches</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.batches.map((batch) => (
              <form key={batch.id} action={updateBatch} className={`rounded-xl border p-4 ${testerToneClasses(testerTone(batch.status))}`}>
                <input type="hidden" name="id" value={batch.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{batch.audience} · {batch.status} · target {batch.target_count}</div>
                    <h3 className="mt-1 font-black">{batch.title}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">Owner: {batch.owner || "Unassigned"}{batch.send_date ? ` · Send ${batch.send_date}` : ""}</p>
                    {batch.message && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{batch.message}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2"><button name="status" value="ready" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Ready</button><button name="status" value="sent" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Sent</button><button name="status" value="closed" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">Close</button></div>
                </div>
              </form>
            ))}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Create invite batch</h2>
          <form action={addBatch} className="mt-5 grid gap-3">
            <label>Title<input name="title" required placeholder="North Island mobile testers" /></label>
            <div className="grid gap-3 md:grid-cols-3"><label>Audience<select name="audience" defaultValue="readers"><option>readers</option><option>contributors</option><option>businesses</option><option>advertisers</option><option>internal</option><option>mixed</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>ready</option><option>sent</option><option>closed</option></select></label><label>Target<input name="target_count" type="number" defaultValue="10" /></label></div>
            <div className="grid gap-3 md:grid-cols-2"><label>Owner<input name="owner" /></label><label>Send date<input name="send_date" type="date" /></label></div>
            <label>Message<textarea name="message" rows={5} /></label>
            <button className="hgn-btn-dark">Create batch</button>
          </form>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Onboarding tasks</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.tasks.map((task) => (
              <form key={task.id} action={updateTask} className={`rounded-xl border p-4 ${testerToneClasses(testerTone(task.status))}`}>
                <input type="hidden" name="id" value={task.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><div className="text-xs font-black uppercase tracking-wide opacity-70">{task.audience} · {task.status} · #{task.sort_order}</div><h3 className="mt-1 font-black">{task.title}</h3>{task.instructions && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{task.instructions}</p>}</div>
                  <div className="flex flex-wrap gap-2"><button name="status" value="active" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Active</button><button name="status" value="paused" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Pause</button><button name="status" value="done" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">Done</button></div>
                </div>
              </form>
            ))}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Add onboarding task</h2>
          <form action={addTask} className="mt-5 grid gap-3">
            <label>Title<input name="title" required /></label>
            <div className="grid gap-3 md:grid-cols-3"><label>Audience<select name="audience" defaultValue="all"><option>all</option><option>readers</option><option>contributors</option><option>businesses</option><option>advertisers</option><option>staff</option></select></label><label>Status<select name="status" defaultValue="active"><option>active</option><option>paused</option><option>done</option></select></label><label>Order<input name="sort_order" type="number" defaultValue="100" /></label></div>
            <label>Instructions<textarea name="instructions" rows={6} /></label>
            <button className="hgn-btn-primary">Add task</button>
          </form>
        </div>
      </section>
    </main>
  );
}
