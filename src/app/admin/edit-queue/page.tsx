import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { editQueueToneClasses, getEditQueueSnapshot, itemCompletionScore, toneForEditQueueItem } from "@/lib/edit-queue-lite";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addEditQueueItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("edit_queue_items").insert({
    title,
    story_slug: String(formData.get("story_slug") || "").trim() || null,
    queue_stage: String(formData.get("queue_stage") || "needs_edit"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    due_label: String(formData.get("due_label") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateEditQueueItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const stage = String(formData.get("queue_stage") || "needs_review");
  const patch: Row = {
    queue_stage: stage,
    headline_done: formData.get("headline_done") === "on",
    body_done: formData.get("body_done") === "on",
    image_done: formData.get("image_done") === "on",
    seo_done: formData.get("seo_done") === "on",
    homepage_done: formData.get("homepage_done") === "on",
    updated_at: new Date().toISOString(),
  };

  if (stage === "done" || stage === "published") {
    patch.completed_at = new Date().toISOString();
  }

  await supabase.from("edit_queue_items").update(patch).eq("id", id);
}

function CheckRow({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 text-sm font-bold">
      <input name={name} type="checkbox" defaultChecked={checked} />
      {label}
    </label>
  );
}

function QueueCard({ item }: { item: Row }) {
  const completion = itemCompletionScore(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${editQueueToneClasses(toneForEditQueueItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.queue_stage}</span>
        <span>·</span>
        <span>{item.priority}</span>
        <span>·</span>
        <span>{item.owner || "Admin / Editor"}</span>
        {item.due_label ? <span>· {item.due_label}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.story_slug ? <p className="mt-1 text-xs font-bold opacity-70">/{item.story_slug}</p> : null}
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${completion}%` }} />
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-70">Checklist {completion}%</p>
      <form action={updateEditQueueItem} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={item.id} />
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckRow name="headline_done" label="Headline" checked={Boolean(item.headline_done)} />
          <CheckRow name="body_done" label="Body copy" checked={Boolean(item.body_done)} />
          <CheckRow name="image_done" label="Image" checked={Boolean(item.image_done)} />
          <CheckRow name="seo_done" label="SEO" checked={Boolean(item.seo_done)} />
          <CheckRow name="homepage_done" label="Homepage" checked={Boolean(item.homepage_done)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {["needs_edit", "needs_review", "needs_media", "ready", "blocked", "published", "done"].map((stage) => (
            <button key={stage} name="queue_stage" value={stage} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
              {stage}
            </button>
          ))}
        </div>
      </form>
    </article>
  );
}

export default async function EditQueuePage() {
  const snapshot = await getEditQueueSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Edit ready", `${snapshot.score}%`, "Simple signal for today", scoreTone],
    ["Active", snapshot.active.length, "Keep this short", snapshot.active.length > 8 ? "warn" : "good"],
    ["Blocked", snapshot.blocked.length, "Needs attention", snapshot.blocked.length ? "bad" : "good"],
    ["Needs media", snapshot.needsMedia.length, "Photo/caption/alt work", snapshot.needsMedia.length > 2 ? "warn" : "blue"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v103 Edit Queue Lite</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Edit Queue</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A lightweight final-edit board for the two-person admin/editor beta. Track only what needs copy, image, SEO or homepage attention before it goes live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/admin/publish-sweep" className="hgn-btn-dark">Publish Sweep</Link>
          <Link href="/edit-queue-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${editQueueToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-hgnNavy">Final edit items</h2>
            <span className="text-sm font-bold text-slate-500">Copy · image · SEO · homepage</span>
          </div>
          {snapshot.items.length ? snapshot.items.map((item) => <QueueCard key={item.id} item={item} />) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No edit items yet. Add only stories that need final attention.</div>}
        </div>

        <div className="grid gap-6">
          <form action={addEditQueueItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add edit item</h2>
            <input name="title" placeholder="Story or homepage item" className="rounded-xl border px-4 py-3" />
            <input name="story_slug" placeholder="Story slug, optional" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="queue_stage" className="rounded-xl border px-4 py-3">
                <option value="needs_edit">Needs edit</option>
                <option value="needs_review">Needs review</option>
                <option value="needs_media">Needs media</option>
                <option value="ready">Ready</option>
                <option value="blocked">Blocked</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select name="owner" className="rounded-xl border px-4 py-3">
                <option>Admin / Editor</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
              <input name="due_label" placeholder="Today, before noon, etc." className="rounded-xl border px-4 py-3" />
            </div>
            <textarea name="notes" placeholder="What needs fixing?" className="min-h-24 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to edit queue</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">How to use it</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              <p><strong>Editor:</strong> final read, headline, spelling and context.</p>
              <p><strong>Admin:</strong> image, SEO, homepage placement and publish timing.</p>
              <p><strong>Both:</strong> mark ready only when the story can go live without another pass.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
