import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { briefTone, briefToneClasses, getPublishBriefSnapshot } from "@/lib/publish-brief";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addBrief(formData: FormData) {
  "use server";
  const brief_date = String(formData.get("brief_date") || new Date().toISOString().slice(0, 10));
  await supabase.from("daily_publish_briefs").insert({
    brief_date,
    lead_story: String(formData.get("lead_story") || "").trim() || null,
    editor_focus: String(formData.get("editor_focus") || "").trim() || null,
    admin_focus: String(formData.get("admin_focus") || "").trim() || null,
    homepage_plan: String(formData.get("homepage_plan") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    status: String(formData.get("status") || "open"),
  });
}

async function addBriefItem(formData: FormData) {
  "use server";
  const task_title = String(formData.get("task_title") || "").trim();
  if (!task_title) return;
  await supabase.from("daily_publish_brief_items").insert({
    task_title,
    task_type: String(formData.get("task_type") || "publish"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    related_story: String(formData.get("related_story") || "").trim() || null,
    is_blocking: formData.get("is_blocking") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateItemStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "done" || status === "published") patch.completed_at = new Date().toISOString();
  await supabase.from("daily_publish_brief_items").update(patch).eq("id", id);
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

function StatusButtons({ id }: { id: string }) {
  const states = ["open", "ready", "waiting", "blocked", "done", "published", "dropped"];
  return (
    <form action={updateItemStatus} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {states.map((state) => (
        <button key={state} name="status" value={state} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
          {state}
        </button>
      ))}
    </form>
  );
}

export default async function PublishBriefAdminPage() {
  const snapshot = await getPublishBriefSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Brief ready", `${snapshot.score}%`, "Daily publish clarity", scoreTone],
    ["Open items", snapshot.activeItems.length, "Keep this short", snapshot.activeItems.length > 8 ? "warn" : "good"],
    ["Blockers", snapshot.blockers.length, "Fix before publishing", snapshot.blockers.length ? "bad" : "good"],
    ["Ready", snapshot.readyItems.length, "Items that can move", snapshot.readyItems.length ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v98 Admin/Editor Workflow</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Publish Brief</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A one-page morning plan for what should go live today, what is blocked and who is handling the next step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link>
          <Link href="/admin/storyboard" className="hgn-btn-dark">Storyboard</Link>
          <Link href="/publish-brief-status" className="hgn-btn-primary">Public status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${briefToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Today&apos;s brief</h2>
            {snapshot.todayBrief ? (
              <article className="mt-4 rounded-2xl border bg-slate-50 p-5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {snapshot.todayBrief.brief_date} · {snapshot.todayBrief.status}
                </div>
                <h3 className="mt-2 text-xl font-black text-hgnNavy">{snapshot.todayBrief.lead_story || "No lead selected yet"}</h3>
                <dl className="mt-4 grid gap-3 text-sm text-slate-700">
                  <div><dt className="font-black text-slate-900">Editor focus</dt><dd>{snapshot.todayBrief.editor_focus || "Not set"}</dd></div>
                  <div><dt className="font-black text-slate-900">Admin focus</dt><dd>{snapshot.todayBrief.admin_focus || "Not set"}</dd></div>
                  <div><dt className="font-black text-slate-900">Homepage plan</dt><dd>{snapshot.todayBrief.homepage_plan || "Not set"}</dd></div>
                  <div><dt className="font-black text-slate-900">Notes</dt><dd>{snapshot.todayBrief.notes || "No notes"}</dd></div>
                </dl>
              </article>
            ) : (
              <EmptyState label="No publish brief yet. Add one below." />
            )}

            <form action={addBrief} className="mt-6 grid gap-3 rounded-2xl border bg-white p-4">
              <h3 className="font-black text-hgnNavy">Add daily brief</h3>
              <label>Date<input name="brief_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
              <label>Lead story<input name="lead_story" placeholder="What should lead today?" /></label>
              <label>Editor focus<textarea name="editor_focus" rows={2} /></label>
              <label>Admin focus<textarea name="admin_focus" rows={2} /></label>
              <label>Homepage plan<textarea name="homepage_plan" rows={2} /></label>
              <label>Notes<textarea name="notes" rows={3} /></label>
              <button className="hgn-btn-primary">Save brief</button>
            </form>
          </div>
        </div>

        <div className="hgn-card p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Publish items</h2>
          <p className="mt-1 text-sm text-slate-600">Use this as the small shared checklist for today. Anything blocked should be obvious.</p>
          <div className="mt-4 grid gap-3">
            {snapshot.items.length ? snapshot.items.map((item) => (
              <article key={item.id} className={`rounded-xl border p-4 ${briefToneClasses(briefTone(item.status, item.is_blocking))}`}>
                <div className="text-xs font-black uppercase tracking-wide opacity-70">
                  #{item.sort_order} · {item.task_type} · {item.status} · {item.owner || "Admin / Editor"}
                </div>
                <h3 className="mt-1 text-lg font-black">{item.task_title}</h3>
                {item.related_story && <p className="mt-1 text-sm font-bold opacity-80">Story: {item.related_story}</p>}
                {item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}
                {item.is_blocking && <p className="mt-2 text-xs font-black uppercase tracking-widest text-rose-700">Blocking publish</p>}
                <StatusButtons id={item.id} />
              </article>
            )) : <EmptyState label="No publish items yet." />}
          </div>

          <form action={addBriefItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-black text-hgnNavy">Add item</h3>
            <label>Task<input name="task_title" required /></label>
            <div className="grid gap-3 md:grid-cols-4">
              <label>Order<input name="sort_order" type="number" defaultValue="100" /></label>
              <label>Type<select name="task_type" defaultValue="publish"><option>publish</option><option>copy</option><option>photo</option><option>homepage</option><option>seo</option><option>handoff</option></select></label>
              <label>Status<select name="status" defaultValue="open"><option>open</option><option>ready</option><option>waiting</option><option>blocked</option></select></label>
              <label>Owner<input name="owner" defaultValue="Admin / Editor" /></label>
            </div>
            <label>Related story<input name="related_story" placeholder="optional" /></label>
            <label>Notes<textarea name="notes" rows={3} /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input name="is_blocking" type="checkbox" /> Blocking today&apos;s publish</label>
            <button className="hgn-btn-primary">Save item</button>
          </form>
        </div>
      </section>
    </main>
  );
}
