import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getRightsDeskSnapshot, rightsTone, rightsToneClasses } from "@/lib/rights-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function createAsset(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("content_rights_assets").insert({
    title,
    asset_type: String(formData.get("asset_type") || "photo"),
    source_name: String(formData.get("source_name") || "").trim() || null,
    source_contact: String(formData.get("source_contact") || "").trim() || null,
    license_status: String(formData.get("license_status") || "needs-review"),
    usage_scope: String(formData.get("usage_scope") || "").trim() || null,
    credit_line: String(formData.get("credit_line") || "").trim() || null,
    related_article_slug: slugify(String(formData.get("related_article_slug") || "")) || null,
    file_url: String(formData.get("file_url") || "").trim() || null,
    expires_at: String(formData.get("expires_at") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createRelease(formData: FormData) {
  "use server";
  const subject_name = String(formData.get("subject_name") || "").trim();
  if (!subject_name) return;
  await supabase.from("content_release_forms").insert({
    subject_name,
    release_type: String(formData.get("release_type") || "photo-release"),
    status: String(formData.get("status") || "needed"),
    signer_contact: String(formData.get("signer_contact") || "").trim() || null,
    asset_title: String(formData.get("asset_title") || "").trim() || null,
    related_article_slug: slugify(String(formData.get("related_article_slug") || "")) || null,
    expires_at: String(formData.get("expires_at") || "") || null,
    storage_url: String(formData.get("storage_url") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createTakedown(formData: FormData) {
  "use server";
  const claim_summary = String(formData.get("claim_summary") || "").trim();
  if (!claim_summary) return;
  await supabase.from("takedown_requests").insert({
    requester_name: String(formData.get("requester_name") || "").trim() || null,
    requester_contact: String(formData.get("requester_contact") || "").trim() || null,
    request_type: String(formData.get("request_type") || "rights"),
    status: String(formData.get("status") || "new"),
    priority: String(formData.get("priority") || "normal"),
    content_url: String(formData.get("content_url") || "").trim() || null,
    related_article_slug: slugify(String(formData.get("related_article_slug") || "")) || null,
    claim_summary,
    response_notes: String(formData.get("response_notes") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("rights_review_tasks").insert({
    title,
    rights_area: String(formData.get("rights_area") || "media"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    related_article_slug: slugify(String(formData.get("related_article_slug") || "")) || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const field = String(formData.get("field") || "status");
  const status = String(formData.get("status") || "");
  const allowed = ["content_rights_assets", "content_release_forms", "takedown_requests", "rights_review_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { [field]: status, updated_at: new Date().toISOString() };
  if (["approved", "cleared", "complete", "done", "resolved", "signed", "licensed"].includes(status)) patch.resolved_at = new Date().toISOString();
  if (table === "content_release_forms" && status === "signed") patch.signed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, field = "status", values }: { table: string; id: string; field?: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="field" value={field} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function RightsDeskPage() {
  const snapshot = await getRightsDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Rights readiness", `${snapshot.score}%`, "Assets, releases, takedowns and tasks", signal],
    ["Assets needing review", snapshot.needsReviewAssets.length, "Photos, graphics and supplied media", snapshot.needsReviewAssets.length ? "warn" : "good"],
    ["Open releases", snapshot.openReleases.length, "Photo/interview consent still needed", snapshot.openReleases.length ? "warn" : "good"],
    ["Open takedowns", snapshot.openTakedowns.length, "Claims that need response", snapshot.openTakedowns.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v85 Rights Desk</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Rights Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Track photo rights, source permissions, release forms, takedown claims and content licensing before HGN opens beta traffic wider.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/rights" className="hgn-btn-primary">Public rights page</Link><Link href="/admin/policy-desk" className="hgn-btn-dark">Policy desk</Link><Link href="/admin/media" className="hgn-btn-dark">Media</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${rightsToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Content rights assets</h2><div className="mt-5 grid gap-3">{snapshot.assets.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${rightsToneClasses(rightsTone(item.license_status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.asset_type} · {item.license_status}</div><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.source_name, item.credit_line, item.related_article_slug].filter(Boolean).join(" · ") || "No source or credit recorded"}</p>{item.usage_scope && <p className="mt-2 text-sm opacity-80">Usage: {item.usage_scope}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="content_rights_assets" id={item.id} field="license_status" values={["unknown", "needs-review", "licensed", "cleared"]} /></article>)}</div><form action={createAsset} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add rights asset</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="asset_type" defaultValue="photo" /></label><label>Status<select name="license_status" defaultValue="needs-review"><option>unknown</option><option>needs-review</option><option>licensed</option><option>cleared</option></select></label><label>Article slug<input name="related_article_slug" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Source<input name="source_name" /></label><label>Source contact<input name="source_contact" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Credit line<input name="credit_line" /></label><label>Usage scope<input name="usage_scope" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>File URL<input name="file_url" /></label><label>Expires<input name="expires_at" type="date" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save asset</button></form></div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Release forms</h2><div className="mt-4 grid gap-3">{snapshot.releases.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${rightsToneClasses(rightsTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.release_type} · {item.status}</div><h3 className="mt-1 font-black">{item.subject_name}</h3><p className="mt-1 text-sm opacity-80">{[item.asset_title, item.related_article_slug, item.signer_contact].filter(Boolean).join(" · ") || "No asset linked"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="content_release_forms" id={item.id} values={["needed", "pending", "signed", "expired"]} /></article>)}</div><form action={createRelease} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add release</h3><label>Subject name<input name="subject_name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="release_type" defaultValue="photo-release" /></label><label>Status<select name="status" defaultValue="needed"><option>needed</option><option>pending</option><option>signed</option><option>expired</option></select></label></div><label>Signer contact<input name="signer_contact" /></label><div className="grid gap-3 md:grid-cols-2"><label>Asset title<input name="asset_title" /></label><label>Article slug<input name="related_article_slug" /></label></div><label>Storage URL<input name="storage_url" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save release</button></form></div></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Takedown and rights claims</h2><div className="mt-4 grid gap-3">{snapshot.takedowns.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${rightsToneClasses(rightsTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.request_type} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.claim_summary}</h3><p className="mt-1 text-sm opacity-80">{[item.requester_name, item.content_url, item.related_article_slug].filter(Boolean).join(" · ") || "No content link recorded"}</p>{item.response_notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.response_notes}</p>}<StatusButtons table="takedown_requests" id={item.id} values={["new", "review", "blocked", "resolved"]} /></article>)}</div><form action={createTakedown} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Log takedown claim</h3><div className="grid gap-3 md:grid-cols-2"><label>Requester<input name="requester_name" /></label><label>Contact<input name="requester_contact" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="request_type" defaultValue="rights" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="new"><option>new</option><option>review</option><option>blocked</option><option>resolved</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Content URL<input name="content_url" /></label><label>Article slug<input name="related_article_slug" /></label></div><label>Claim summary<textarea name="claim_summary" required rows={3} /></label><label>Response notes<textarea name="response_notes" rows={3} /></label><button className="hgn-btn-primary">Save claim</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Rights review tasks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${rightsToneClasses(rightsTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.rights_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.due_date, item.related_article_slug].filter(Boolean).join(" · ") || "No owner or due date"}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="rights_review_tasks" id={item.id} values={["todo", "in-progress", "blocked", "done"]} /></article>)}</div><form action={createTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add task</h3><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Area<input name="rights_area" defaultValue="media" /></label><label>Owner<input name="owner" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>in-progress</option><option>blocked</option><option>done</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Due date<input name="due_date" type="date" /></label></div><label>Article slug<input name="related_article_slug" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save task</button></form></div>
    </section>
  </main>;
}
