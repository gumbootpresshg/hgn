import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { commsTone, commsToneClasses, getLaunchCommsSnapshot } from "@/lib/launch-comms";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createTemplate(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_comms_templates").insert({
    title,
    channel: String(formData.get("channel") || "newsletter"),
    audience: String(formData.get("audience") || "beta-readers"),
    purpose: String(formData.get("purpose") || "update"),
    subject: String(formData.get("subject") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
  });
}

async function createQueueItem(formData: FormData) {
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

async function updateQueueStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "draft");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  await supabase.from("beta_comms_queue").update(patch).eq("id", id);
}

async function createUpdatePost(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_update_posts").insert({
    title,
    summary: String(formData.get("summary") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    status: String(formData.get("status") || "draft"),
    visibility: String(formData.get("visibility") || "public"),
    category: String(formData.get("category") || "release"),
    published_at: String(formData.get("published_at") || "") || null,
  });
}

async function updatePostStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "draft");
  if (!id) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["published", "scheduled"].includes(status) && !String(formData.get("published_at") || "")) patch.published_at = new Date().toISOString();
  await supabase.from("beta_update_posts").update(patch).eq("id", id);
}

export default async function BetaCommsPage() {
  const snapshot = await getLaunchCommsSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Comms readiness", `${snapshot.score}%`, "Templates, queue, public updates and tester reach", signal],
    ["Ready/sent messages", snapshot.ready, "Approved, scheduled or sent queue items", snapshot.ready ? "good" : "warn"],
    ["Draft/review items", snapshot.queued, "Messages still needing attention", snapshot.queued ? "warn" : "good"],
    ["Public updates", snapshot.publicUpdates, "Published or approved public beta notes", snapshot.publicUpdates ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v70 Launch Comms Center</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Beta Communications Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">Plan beta invites, reader updates, contributor notes and public release messaging from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/beta-updates" className="hgn-btn-primary">Public updates</Link>
          <Link href="/admin/launch-room" className="hgn-btn-dark">Launch room</Link>
          <Link href="/admin/beta-testers" className="hgn-btn-dark">Testers</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${commsToneClasses(tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Message queue</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.queue.map((item) => (
              <form key={item.id} action={updateQueueStatus} className={`rounded-xl border p-4 ${commsToneClasses(commsTone(item.status))}`}>
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{item.channel} · {item.audience} · {item.status}</div>
                    <h3 className="mt-1 font-black">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">{item.send_at ? `Send: ${new Date(item.send_at).toLocaleString()}` : "No send time"}</p>
                    {item.body && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.body}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button name="status" value="review" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Review</button>
                    <button name="status" value="approved" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Approve</button>
                    <button name="status" value="scheduled" className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">Schedule</button>
                    <button name="status" value="sent" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Sent</button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Create message</h2>
            <form action={createQueueItem} className="mt-5 grid gap-3">
              <label>Title<input name="title" required placeholder="Closed beta reminder" /></label>
              <div className="grid gap-3 md:grid-cols-2"><label>Channel<select name="channel" defaultValue="newsletter"><option>newsletter</option><option>social</option><option>site-banner</option><option>direct</option><option>print</option><option>other</option></select></label><label>Audience<select name="audience" defaultValue="beta-readers"><option>beta-readers</option><option>contributors</option><option>advertisers</option><option>public</option><option>internal</option></select></label></div>
              <div className="grid gap-3 md:grid-cols-2"><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>approved</option><option>scheduled</option></select></label><label>Send at<input name="send_at" type="datetime-local" /></label></div>
              <label>Body<textarea name="body" rows={6} /></label>
              <button className="hgn-btn-primary">Add to queue</button>
            </form>
          </div>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Create template</h2>
            <form action={createTemplate} className="mt-5 grid gap-3">
              <label>Title<input name="title" required /></label>
              <div className="grid gap-3 md:grid-cols-2"><label>Channel<select name="channel" defaultValue="newsletter"><option>newsletter</option><option>social</option><option>site-banner</option><option>direct</option><option>print</option><option>other</option></select></label><label>Audience<select name="audience" defaultValue="beta-readers"><option>beta-readers</option><option>contributors</option><option>advertisers</option><option>public</option><option>internal</option></select></label></div>
              <div className="grid gap-3 md:grid-cols-2"><label>Purpose<select name="purpose" defaultValue="update"><option>invite</option><option>update</option><option>reminder</option><option>issue</option><option>release</option></select></label><label>Owner<input name="owner" /></label></div>
              <label>Subject<input name="subject" /></label>
              <label>Body<textarea name="body" rows={6} /></label>
              <button className="hgn-btn-dark">Save template</button>
            </form>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Public/internal beta updates</h2>
          <div className="mt-5 grid gap-3">
            {snapshot.updates.map((post) => (
              <form key={post.id} action={updatePostStatus} className={`rounded-xl border p-4 ${commsToneClasses(commsTone(post.status))}`}>
                <input type="hidden" name="id" value={post.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><div className="text-xs font-black uppercase tracking-wide opacity-70">{post.category} · {post.visibility} · {post.status}</div><h3 className="mt-1 font-black">{post.title}</h3>{post.summary && <p className="mt-2 text-sm opacity-80">{post.summary}</p>}</div>
                  <div className="flex flex-wrap gap-2"><button name="status" value="review" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white">Review</button><button name="status" value="approved" className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Approve</button><button name="status" value="published" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Publish</button></div>
                </div>
              </form>
            ))}
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Create beta update</h2>
          <form action={createUpdatePost} className="mt-5 grid gap-3">
            <label>Title<input name="title" required /></label>
            <div className="grid gap-3 md:grid-cols-3"><label>Category<select name="category" defaultValue="release"><option>release</option><option>known-issue</option><option>fix</option><option>request</option><option>announcement</option></select></label><label>Visibility<select name="visibility" defaultValue="public"><option>public</option><option>beta-only</option><option>internal</option></select></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>approved</option><option>published</option></select></label></div>
            <label>Published at<input name="published_at" type="datetime-local" /></label>
            <label>Summary<input name="summary" /></label>
            <label>Body<textarea name="body" rows={7} /></label>
            <button className="hgn-btn-primary">Save update</button>
          </form>
        </div>
      </section>

      <section className="mt-8 hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Saved templates</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {snapshot.templates.map((template) => (
            <article key={template.id} className="rounded-xl border bg-white p-4">
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">{template.channel} · {template.audience} · {template.purpose}</div>
              <h3 className="mt-1 font-black text-hgnNavy">{template.title}</h3>
              {template.subject && <p className="mt-1 text-sm font-semibold text-slate-700">Subject: {template.subject}</p>}
              {template.body && <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{template.body}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
