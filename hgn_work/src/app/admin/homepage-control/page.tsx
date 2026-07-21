import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getHomepageControlSnapshot, homepageControlTone, homepageControlToneClasses, isHomepageSlotStale } from "@/lib/homepage-control";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function saveSlot(formData: FormData) {
  "use server";
  const slot_key = String(formData.get("slot_key") || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const slot_label = String(formData.get("slot_label") || "").trim();
  if (!slot_key || !slot_label) return;
  await supabase.from("homepage_control_slots").upsert({
    slot_key,
    slot_label,
    section: String(formData.get("section") || "front_page"),
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    story_title: String(formData.get("story_title") || "").trim() || null,
    deck: String(formData.get("deck") || "").trim() || null,
    image_url: String(formData.get("image_url") || "").trim() || null,
    slot_order: Number(formData.get("slot_order") || 0),
    is_visible: formData.get("is_visible") === "on",
    is_pinned: formData.get("is_pinned") === "on",
    status: String(formData.get("status") || "empty"),
    freshness_hours: Number(formData.get("freshness_hours") || 24),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    published_at: formData.get("published_now") === "on" ? new Date().toISOString() : null,
    last_checked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "slot_key" });
}

async function saveCheck(formData: FormData) {
  "use server";
  const check_label = String(formData.get("check_label") || "").trim();
  if (!check_label) return;
  await supabase.from("homepage_control_checks").insert({
    check_label,
    check_area: String(formData.get("check_area") || "homepage"),
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
  if (!id || !status || !["homepage_control_slots", "homepage_control_checks"].includes(table)) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "homepage_control_slots") patch.last_checked_at = new Date().toISOString();
  if (["done", "complete", "closed"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function HomepageControlPage() {
  const snapshot = await getHomepageControlSnapshot();
  const scoreTone = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Homepage ready", `${snapshot.score}%`, "Simple daily front-page confidence score", scoreTone],
    ["Visible slots", snapshot.visibleSlots.length, "Slots currently intended for the public homepage", snapshot.visibleSlots.length >= 3 ? "good" : "warn"],
    ["Empty slots", snapshot.emptySlots.length, "Visible slots without a story or slug", snapshot.emptySlots.length > 1 ? "warn" : "good"],
    ["Stale slots", snapshot.staleSlots.length, "Items older than their freshness window", snapshot.staleSlots.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v92 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Homepage Control</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A lightweight front-page desk for the current beta reality: two people keeping HGN useful, current, and easy to publish.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link><Link href="/admin/copy-desk" className="hgn-btn-dark">Copy desk</Link><Link href="/homepage-status" className="hgn-btn-primary">Public status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${homepageControlToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Front-page slots</h2><p className="mt-1 text-sm text-slate-600">Use this to decide what readers see first. Keep the visible list small and intentional.</p><div className="mt-4 grid gap-3">{snapshot.slots.length ? snapshot.slots.map((slot) => { const stale = isHomepageSlotStale(slot); const tone = stale ? "bad" : homepageControlTone(slot.status); return <article key={slot.id} className={`rounded-xl border p-4 ${homepageControlToneClasses(tone)}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-black uppercase tracking-wide opacity-70">#{slot.slot_order} · {slot.section} · {slot.status}{stale ? " · stale" : ""}</div><div className="flex gap-2 text-xs font-black opacity-70">{slot.is_visible ? <span>visible</span> : <span>hidden</span>}{slot.is_pinned && <span>pinned</span>}</div></div><h3 className="mt-1 text-lg font-black">{slot.slot_label}</h3><p className="mt-1 text-sm opacity-80">{[slot.story_title, slot.article_slug].filter(Boolean).join(" · ") || "No story assigned yet"}</p>{slot.deck && <p className="mt-2 text-sm opacity-80">{slot.deck}</p>}{slot.notes && <p className="mt-2 text-sm opacity-80">Note: {slot.notes}</p>}<StatusButtons table="homepage_control_slots" id={slot.id} values={["empty", "drafting", "ready", "current", "stale", "hidden"]} /></article>; }) : <Empty label="No homepage slots yet. Run the v92 SQL seed or add one below." />}</div>
        <form action={saveSlot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add or update slot</h3><div className="grid gap-3 md:grid-cols-3"><label>Slot key<input name="slot_key" required placeholder="hero" /></label><label>Label<input name="slot_label" required placeholder="Main hero story" /></label><label>Order<input name="slot_order" type="number" defaultValue="1" /></label></div><div className="grid gap-3 md:grid-cols-4"><label>Section<input name="section" defaultValue="front_page" /></label><label>Status<select name="status" defaultValue="ready"><option>empty</option><option>drafting</option><option>ready</option><option>current</option><option>stale</option><option>hidden</option></select></label><label>Freshness hours<input name="freshness_hours" type="number" defaultValue="24" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label></div><label>Story title<input name="story_title" /></label><label>Article slug<input name="article_slug" /></label><label>Deck<textarea name="deck" rows={2} /></label><label>Image URL<input name="image_url" /></label><label>Notes<textarea name="notes" rows={3} /></label><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="is_visible" type="checkbox" defaultChecked /> Visible</label><label className="flex items-center gap-2"><input name="is_pinned" type="checkbox" /> Pinned</label><label className="flex items-center gap-2"><input name="published_now" type="checkbox" /> Mark fresh now</label></div><button className="hgn-btn-primary">Save homepage slot</button></form>
      </div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Daily homepage checks</h2><p className="mt-1 text-sm text-slate-600">A tiny checklist for the admin/editor beta workflow.</p><div className="mt-4 grid gap-3">{snapshot.checks.length ? snapshot.checks.map((check) => <article key={check.id} className={`rounded-xl border p-4 ${homepageControlToneClasses(homepageControlTone(check.status, check.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{check.check_area} · {check.priority} · {check.status}</div><h3 className="mt-1 font-black">{check.check_label}</h3>{check.notes && <p className="mt-2 text-sm opacity-80">{check.notes}</p>}<StatusButtons table="homepage_control_checks" id={check.id} values={["todo", "doing", "done"]} /></article>) : <Empty label="No homepage checks yet." />}</div><form action={saveCheck} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add check</h3><label>Check<input name="check_label" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Area<input name="check_area" defaultValue="homepage" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>done</option></select></label></div><label>Owner<input name="owner" placeholder="Admin / Editor" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save check</button></form></div>
    </section>
  </main>;
}
