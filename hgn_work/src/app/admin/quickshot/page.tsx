import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getQuickshotSnapshot, quickshotToneClasses, toneForQuickshot } from "@/lib/quickshot-publisher";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addQuickshot(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("quickshot_posts").insert({
    title,
    update_type: String(formData.get("update_type") || "local_update"),
    status: String(formData.get("status") || "draft"),
    priority: String(formData.get("priority") || "normal"),
    channel: String(formData.get("channel") || "site"),
    summary: String(formData.get("summary") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_time: String(formData.get("target_time") || "").trim() || null,
    photo_needed: formData.get("photo_needed") === "on",
    homepage_ready: formData.get("homepage_ready") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateQuickshotStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;

  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "published") patch.published_at = new Date().toISOString();
  if (status === "ready") patch.homepage_ready = true;
  await supabase.from("quickshot_posts").update(patch).eq("id", id);
}

function StatusButtons({ id }: { id: string }) {
  const statuses = ["draft", "working", "needs_photo", "ready", "published", "blocked"];
  return (
    <form action={updateQuickshotStatus} className="mt-4 flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {statuses.map((status) => (
        <button key={status} name="status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
          {status}
        </button>
      ))}
    </form>
  );
}

function QuickshotCard({ post }: { post: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${quickshotToneClasses(toneForQuickshot(post))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{post.update_type}</span>
        <span>·</span>
        <span>{post.priority}</span>
        <span>·</span>
        <span>{post.channel}</span>
        {post.target_time ? <span>· {post.target_time}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{post.title}</h3>
      {post.summary ? <p className="mt-2 text-sm leading-6 opacity-80">{post.summary}</p> : null}
      {post.body ? <p className="mt-2 text-sm leading-6 opacity-80">{post.body}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>Status: {post.status}</span>
        {post.photo_needed ? <span>Photo needed</span> : null}
        {post.homepage_ready ? <span>Homepage ready</span> : null}
      </div>
      <StatusButtons id={post.id} />
    </article>
  );
}

export default async function QuickshotPage() {
  const snapshot = await getQuickshotSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Quickshot ready", `${snapshot.score}%`, "Short updates can move quickly", scoreTone],
    ["Drafts", snapshot.drafts.length, "Small updates in progress", snapshot.drafts.length > 8 ? "warn" : "blue"],
    ["Ready", snapshot.ready.length, "Can publish or place", "good"],
    ["Blocked", snapshot.blockers.length, "Needs photo or fix", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v102 Two-Person Publishing</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Quickshot Publisher</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A lightweight desk for small local updates that should not become a full article. Use it for weather, ferry, community and quick homepage notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/admin/media-flow" className="hgn-btn-dark">Media Flow</Link>
          <Link href="/quickshot-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${quickshotToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-hgnNavy">Quick updates</h2>
            <span className="text-sm font-bold text-slate-500">Short, verified, useful</span>
          </div>
          {snapshot.posts.length ? (
            snapshot.posts.map((post) => <QuickshotCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No quick updates yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addQuickshot} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add quick update</h2>
            <input name="title" placeholder="Example: Ferry delay for northbound sailing" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="update_type" className="rounded-xl border px-4 py-3">
                <option value="local_update">Local update</option>
                <option value="weather">Weather</option>
                <option value="travel">Ferry / travel</option>
                <option value="community">Community</option>
                <option value="homepage">Homepage note</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select name="channel" className="rounded-xl border px-4 py-3">
                <option value="site">Site</option>
                <option value="homepage">Homepage</option>
                <option value="newsletter">Newsletter</option>
                <option value="social">Social</option>
              </select>
              <input name="target_time" placeholder="Target time, optional" className="rounded-xl border px-4 py-3" />
            </div>
            <textarea name="summary" placeholder="One or two sentence reader-facing summary" className="min-h-20 rounded-xl border px-4 py-3" />
            <textarea name="body" placeholder="Optional details, source or next update" className="min-h-24 rounded-xl border px-4 py-3" />
            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" name="photo_needed" /> Photo needed</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="homepage_ready" /> Homepage ready</label>
            </div>
            <button className="hgn-btn-primary">Add quickshot</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Templates</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.templates.map((template) => (
                <div key={template.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-sm font-black text-hgnNavy">{template.name}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{template.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
