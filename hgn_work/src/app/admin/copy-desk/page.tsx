import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { copyDeskTone, copyDeskToneClasses, getCopyDeskSnapshot } from "@/lib/copy-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createCopyItem(formData: FormData) {
  "use server";
  const article_title = String(formData.get("article_title") || "").trim();
  if (!article_title) return;
  await supabase.from("copy_desk_items").insert({
    article_title,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    desk_area: String(formData.get("desk_area") || "copy"),
    owner: String(formData.get("owner") || "").trim() || null,
    status: String(formData.get("status") || "needs_review"),
    priority: String(formData.get("priority") || "normal"),
    issue_summary: String(formData.get("issue_summary") || "").trim() || null,
    fix_notes: String(formData.get("fix_notes") || "").trim() || null,
    publish_blocker: formData.get("publish_blocker") === "on",
    homepage_sensitive: formData.get("homepage_sensitive") === "on",
  });
}

async function createStyleNote(formData: FormData) {
  "use server";
  const note_title = String(formData.get("note_title") || "").trim();
  if (!note_title) return;
  await supabase.from("copy_desk_style_notes").insert({
    note_title,
    note_body: String(formData.get("note_body") || "").trim() || null,
    note_type: String(formData.get("note_type") || "style"),
    status: String(formData.get("status") || "active"),
  });
}

async function updateCopyStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["done", "fixed", "approved"].includes(status)) {
    patch.completed_at = new Date().toISOString();
    patch.publish_blocker = false;
  }
  await supabase.from("copy_desk_items").update(patch).eq("id", id);
}

function StatusButtons({ id }: { id: string }) {
  return <form action={updateCopyStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="id" value={id} />{["needs_review", "fixing", "approved", "done"].map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function CopyDeskPage() {
  const snapshot = await getCopyDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Copy readiness", `${snapshot.score}%`, "Small, useful checks before publishing", signal],
    ["Publish blockers", snapshot.blockers.length, "Should be zero before pushing a key story", snapshot.blockers.length ? "bad" : "good"],
    ["Active copy items", snapshot.activeItems.length, "Keep this list short", snapshot.activeItems.length > 6 ? "warn" : "good"],
    ["Required checks", snapshot.requiredChecks.length, "Core checklist items", snapshot.requiredChecks.length >= 4 ? "good" : "warn"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v91 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Copy Desk Polish</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A lightweight final-pass desk for the two-person beta. Use it to catch headline, spelling, image, credit, SEO, and publish-blocking issues without adding heavy process.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link><Link href="/copy-status" className="hgn-btn-primary">Copy status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${copyDeskToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Copy fix queue</h2><p className="mt-1 text-sm text-slate-600">Only add items that would slow publishing or damage trust if missed.</p><div className="mt-4 grid gap-3">{snapshot.items.length ? snapshot.items.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${copyDeskToneClasses(copyDeskTone(item.status, item.priority, item.publish_blocker))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.desk_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.article_title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.article_slug].filter(Boolean).join(" · ") || "No owner/slug"}</p>{item.issue_summary && <p className="mt-2 text-sm opacity-80">Issue: {item.issue_summary}</p>}{item.fix_notes && <p className="mt-1 text-sm opacity-80">Fix: {item.fix_notes}</p>}<div className="mt-2 flex flex-wrap gap-2 text-xs font-bold opacity-75">{item.publish_blocker && <span>publish blocker</span>}{item.homepage_sensitive && <span>homepage sensitive</span>}</div><StatusButtons id={item.id} /></article>) : <Empty label="No copy desk items yet." />}</div>
        <form action={createCopyItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add copy item</h3><label>Article/title<input name="article_title" required placeholder="Story that needs a final pass" /></label><div className="grid gap-3 md:grid-cols-4"><label>Area<input name="desk_area" defaultValue="copy" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="needs_review"><option>needs_review</option><option>fixing</option><option>approved</option><option>done</option></select></label></div><label>Article slug<input name="article_slug" /></label><label>Issue summary<textarea name="issue_summary" rows={2} /></label><label>Fix notes<textarea name="fix_notes" rows={2} /></label><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="publish_blocker" type="checkbox" /> Publish blocker</label><label className="flex items-center gap-2"><input name="homepage_sensitive" type="checkbox" /> Homepage sensitive</label></div><button className="hgn-btn-primary">Save copy item</button></form></div>

      <div className="space-y-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Final-pass checklist</h2><div className="mt-4 grid gap-3">{snapshot.activeChecks.length ? snapshot.activeChecks.map((check) => <div key={check.id} className="rounded-xl border bg-white p-4"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{check.check_group} · {check.required_before_publish ? "required" : "optional"}</div><h3 className="mt-1 font-black text-hgnNavy">{check.check_label}</h3>{check.help_text && <p className="mt-2 text-sm text-slate-600">{check.help_text}</p>}</div>) : <Empty label="No checklist items yet." />}</div></div>
        <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Style notes</h2><div className="mt-4 grid gap-3">{snapshot.activeNotes.length ? snapshot.activeNotes.map((note) => <article key={note.id} className="rounded-xl border bg-white p-4"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{note.note_type} · {note.status}</div><h3 className="mt-1 font-black text-hgnNavy">{note.note_title}</h3>{note.note_body && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{note.note_body}</p>}</article>) : <Empty label="No style notes yet." />}</div><form action={createStyleNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add style note</h3><div className="grid gap-3 md:grid-cols-2"><label>Title<input name="note_title" required /></label><label>Type<input name="note_type" defaultValue="style" /></label></div><label>Note<textarea name="note_body" rows={3} /></label><input type="hidden" name="status" value="active" /><button className="hgn-btn-primary">Save style note</button></form></div></div>
    </section>
  </main>;
}
