import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPreflightSnapshot, preflightTone, toneClasses } from "@/lib/preflight";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function seedChecks(formData: FormData) {
  "use server";
  const articleId = String(formData.get("article_id") || "");
  if (!articleId) return;
  const { data: templates } = await supabase.from("editorial_preflight_templates").select("*").eq("active", true).order("sort_order", { ascending: true });
  const rows = (templates || []).map((template: Row) => ({
    article_id: articleId,
    template_id: template.id,
    label: template.label,
    area: template.area || "Editorial",
    status: "todo",
  }));
  if (rows.length) await supabase.from("article_preflight_checks").insert(rows);
}

async function updateCheck(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "todo");
  if (!id) return;
  await supabase.from("article_preflight_checks").update({ status, checked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
}

async function addNote(formData: FormData) {
  "use server";
  const articleId = String(formData.get("article_id") || "");
  const note = String(formData.get("note") || "").trim();
  if (!articleId || !note) return;
  await supabase.from("article_publish_notes").insert({
    article_id: articleId,
    note,
    note_type: String(formData.get("note_type") || "editorial"),
    owner: String(formData.get("owner") || "").trim() || null,
    status: "open",
  });
}

async function resolveNote(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "resolved");
  if (!id) return;
  await supabase.from("article_publish_notes").update({ status, resolved_at: new Date().toISOString() }).eq("id", id);
}

async function createRun(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("beta_publishing_runs").insert({
    title,
    run_date: String(formData.get("run_date") || new Date().toISOString().slice(0, 10)),
    editor: String(formData.get("editor") || "").trim() || null,
    target_story_count: Number(formData.get("target_story_count") || 3),
    status: String(formData.get("status") || "planned"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

export default async function PreflightPage() {
  const snapshot = await getPreflightSnapshot();
  const stats = [
    ["Average readiness", `${snapshot.averageScore}%`, "Across recent draft/review/published stories", snapshot.averageScore >= 85 ? "good" : snapshot.averageScore >= 65 ? "warn" : "bad"],
    ["Ready stories", snapshot.ready, "Stories scoring 85% or better", snapshot.ready ? "good" : "warn"],
    ["Needs attention", snapshot.blocked, "Low score or open publish notes", snapshot.blocked ? "bad" : "good"],
    ["Publishing runs", snapshot.runs.length, "Beta newsroom production cycles", snapshot.runs.length ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v67 Editorial Preflight</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Publishing QA Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">A final safety layer before beta stories go live: metadata, photo credits, SEO, mobile checks, notes and publishing runs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/articles" className="hgn-btn-dark">Articles</Link>
          <Link href="/admin/beta-ops" className="hgn-btn-primary">Beta ops</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${toneClasses(tone)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm font-semibold opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="grid gap-5">
          {snapshot.articles.map(({ article, checks, notes, auto, score }) => (
            <article key={article.id} className="hgn-card overflow-hidden">
              <div className={`border-b p-5 ${toneClasses(score >= 85 ? "good" : score >= 70 ? "warn" : "bad")}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">{article.status || "draft"} · {article.category || "Uncategorized"}</div>
                    <h2 className="mt-1 text-2xl font-black">{article.title || "Untitled story"}</h2>
                    <p className="mt-1 text-sm font-semibold opacity-80">/{article.slug || "missing-slug"}</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="text-4xl font-black">{score}%</div>
                    <div className="text-xs font-black uppercase tracking-wide opacity-70">preflight score</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <div>
                  <h3 className="font-black text-hgnNavy">Automatic checks</h3>
                  <div className="mt-3 grid gap-2">
                    {auto.map((item) => (
                      <div key={item.label} className={`rounded-xl border p-3 text-sm font-bold ${toneClasses(item.pass ? "good" : "bad")}`}>
                        {item.label}: <span className="font-semibold">{item.helper}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-hgnNavy">Manual checklist</h3>
                    {!checks.length && (
                      <form action={seedChecks}>
                        <input type="hidden" name="article_id" value={article.id} />
                        <button className="rounded-lg bg-hgnBlue px-3 py-2 text-xs font-black text-white">Add checklist</button>
                      </form>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {checks.map((check) => (
                      <form key={check.id} action={updateCheck} className={`rounded-xl border p-3 ${toneClasses(preflightTone(check.status))}`}>
                        <input type="hidden" name="id" value={check.id} />
                        <div className="font-black">{check.label}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button name="status" value="pass" className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-black text-white">Pass</button>
                          <button name="status" value="watch" className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-black text-white">Watch</button>
                          <button name="status" value="fail" className="rounded-lg bg-hgnBlue px-3 py-1.5 text-xs font-black text-white">Fail</button>
                          <button name="status" value="waived" className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-black text-white">Waive</button>
                        </div>
                      </form>
                    ))}
                    {!checks.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No manual checklist added yet.</p>}
                  </div>
                </div>
              </div>

              <div className="border-t bg-slate-50 p-5">
                <h3 className="font-black text-hgnNavy">Publish notes</h3>
                <div className="mt-3 grid gap-2">
                  {notes.map((note) => (
                    <form key={note.id} action={resolveNote} className={`rounded-xl border p-3 ${toneClasses(preflightTone(note.status))}`}>
                      <input type="hidden" name="id" value={note.id} />
                      <div className="text-xs font-black uppercase tracking-wide opacity-70">{note.note_type} · {note.status} · {note.owner || "unassigned"}</div>
                      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold">{note.note}</p>
                      {note.status === "open" && <button name="status" value="resolved" className="mt-2 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-black text-white">Resolve note</button>}
                    </form>
                  ))}
                </div>
                <form action={addNote} className="mt-3 grid gap-3 rounded-xl bg-white p-4 md:grid-cols-[140px_1fr_150px_auto]">
                  <input type="hidden" name="article_id" value={article.id} />
                  <select name="note_type" defaultValue="editorial"><option>editorial</option><option>legal</option><option>photo</option><option>seo</option><option>correction</option><option>launch</option></select>
                  <input name="note" placeholder="Add a blocker, caution or final editor note" />
                  <input name="owner" placeholder="Owner" />
                  <button className="hgn-btn-dark">Add note</button>
                </form>
              </div>
            </article>
          ))}
          {!snapshot.articles.length && <p className="hgn-card p-6 text-slate-600">No articles found for preflight yet.</p>}
        </div>

        <aside className="grid content-start gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Create publishing run</h2>
            <form action={createRun} className="mt-5 grid gap-3">
              <label>Run title<input name="title" required placeholder="Friday beta publishing run" /></label>
              <label>Date<input name="run_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
              <div className="grid gap-3 md:grid-cols-2">
                <label>Editor<input name="editor" placeholder="Editor name" /></label>
                <label>Target stories<input name="target_story_count" type="number" min="1" defaultValue="3" /></label>
              </div>
              <label>Status<select name="status" defaultValue="planned"><option>planned</option><option>in_progress</option><option>published</option><option>blocked</option><option>cancelled</option></select></label>
              <label>Notes<textarea name="notes" rows={4} placeholder="What needs to be published and what must be watched." /></label>
              <button className="hgn-btn-primary">Create run</button>
            </form>
          </div>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Recent publishing runs</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.runs.map((run) => (
                <div key={run.id} className={`rounded-xl border p-4 ${toneClasses(preflightTone(run.status))}`}>
                  <div className="text-xs font-black uppercase tracking-wide opacity-70">{run.run_date} · {run.status}</div>
                  <h3 className="mt-1 font-black">{run.title}</h3>
                  <p className="mt-1 text-sm font-semibold opacity-80">Target: {run.target_story_count} · Actual: {run.actual_story_count} · Editor: {run.editor || "Unassigned"}</p>
                  {run.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{run.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
